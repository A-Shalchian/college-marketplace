import { v } from "convex/values";
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthenticatedUser } from "./security";
import { moderateContent, Blocklist } from "./moderation";

async function getBlocklist(ctx: QueryCtx | MutationCtx): Promise<Blocklist> {
  const setting = await ctx.db
    .query("settings")
    .withIndex("by_key", (q) => q.eq("key", "moderation_blocklist"))
    .unique();

  if (!setting) {
    return { drugs: [], sexual: [], weapons: [], scam: [], coded: [] };
  }

  return JSON.parse(setting.value);
}

export const getEvents = query({
  args: {
    category: v.optional(v.string()),
    campus: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let events = await ctx.db
      .query("events")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .order("desc")
      .take(100);

    if (args.category) {
      events = events.filter((e) => e.category === args.category);
    }
    if (args.campus) {
      events = events.filter((e) => e.campus === args.campus);
    }

    const now = Date.now();
    if (args.status === "upcoming") {
      events = events.filter((e) => e.date > now);
      events.sort((a, b) => a.date - b.date);
    } else if (args.status === "past") {
      events = events.filter((e) => e.date <= now);
    }

    const eventsWithOrganizers = await Promise.all(
      events.map(async (event) => {
        const organizer = await ctx.db.get(event.organizerId);
        const attendeeCount = (
          await ctx.db
            .query("eventAttendees")
            .withIndex("by_event", (q) => q.eq("eventId", event._id))
            .collect()
        ).length;
        return {
          ...event,
          attendeeCount,
          organizer: organizer
            ? { _id: organizer._id, name: organizer.name, imageUrl: organizer.imageUrl }
            : null,
        };
      })
    );

    return eventsWithOrganizers;
  },
});

export const getEventById = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) return null;

    const organizer = await ctx.db.get(event.organizerId);
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    return {
      ...event,
      attendeeCount: attendees.length,
      organizer: organizer
        ? { _id: organizer._id, name: organizer.name, imageUrl: organizer.imageUrl }
        : null,
    };
  },
});

export const getEventAttendees = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    const attendeesWithUsers = await Promise.all(
      attendees.map(async (attendee) => {
        const user = await ctx.db.get(attendee.userId);
        return {
          ...attendee,
          user: user
            ? { _id: user._id, name: user.name, imageUrl: user.imageUrl }
            : null,
        };
      })
    );

    return attendeesWithUsers;
  },
});

export const isAttending = query({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const attendance = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    return attendance || null;
  },
});

export const getUserEvents = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const attendances = await ctx.db
      .query("eventAttendees")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const events = await Promise.all(
      attendances.map(async (a) => {
        const event = await ctx.db.get(a.eventId);
        return event && event.status === "active" ? event : null;
      })
    );

    return events.filter(Boolean);
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    campus: v.string(),
    location: v.string(),
    category: v.string(),
    date: v.number(),
    endDate: v.optional(v.number()),
    maxAttendees: v.optional(v.number()),
    imageId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const title = args.title.trim();
    const description = args.description.trim();
    const location = args.location.trim();

    if (title.length < 3 || title.length > 200) {
      throw new Error("Event title must be between 3 and 200 characters");
    }
    if (description.length < 10 || description.length > 5000) {
      throw new Error("Description must be between 10 and 5,000 characters");
    }
    if (location.length < 2 || location.length > 200) {
      throw new Error("Location must be between 2 and 200 characters");
    }
    if (args.date < Date.now()) {
      throw new Error("Event date must be in the future");
    }
    if (args.endDate && args.endDate <= args.date) {
      throw new Error("End date must be after the start date");
    }
    if (args.maxAttendees !== undefined && args.maxAttendees < 1) {
      throw new Error("Max attendees must be at least 1");
    }

    const blocklist = await getBlocklist(ctx);
    const moderation = moderateContent(title, description, blocklist);

    if (moderation.status === "rejected") {
      throw new Error(
        "Your event contains content that violates our community guidelines and cannot be created."
      );
    }

    const eventId = await ctx.db.insert("events", {
      organizerId: user._id,
      title,
      description,
      campus: args.campus,
      location,
      category: args.category,
      date: args.date,
      endDate: args.endDate,
      maxAttendees: args.maxAttendees,
      ...(args.imageId ? { imageId: args.imageId } : {}),
      status: "active",
      createdAt: Date.now(),
    });

    await ctx.db.insert("eventAttendees", {
      eventId,
      userId: user._id,
      status: "going",
      joinedAt: Date.now(),
    });

    return eventId;
  },
});

export const updateEvent = mutation({
  args: {
    eventId: v.id("events"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    date: v.optional(v.number()),
    endDate: v.optional(v.number()),
    maxAttendees: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (event.organizerId !== user._id && !isAdmin) {
      throw new Error("Only the event organizer or a site admin can update this event");
    }

    const updates: Record<string, unknown> = {};

    if (args.title !== undefined) {
      const title = args.title.trim();
      if (title.length < 3 || title.length > 200) {
        throw new Error("Event title must be between 3 and 200 characters");
      }
      updates.title = title;
    }

    if (args.description !== undefined) {
      const description = args.description.trim();
      if (description.length < 10 || description.length > 5000) {
        throw new Error("Description must be between 10 and 5,000 characters");
      }
      updates.description = description;
    }

    if (args.location !== undefined) {
      const location = args.location.trim();
      if (location.length < 2 || location.length > 200) {
        throw new Error("Location must be between 2 and 200 characters");
      }
      updates.location = location;
    }

    if (args.date !== undefined) {
      updates.date = args.date;
    }

    if (args.endDate !== undefined) {
      updates.endDate = args.endDate;
    }

    if (args.maxAttendees !== undefined) {
      if (args.maxAttendees < 1) {
        throw new Error("Max attendees must be at least 1");
      }
      updates.maxAttendees = args.maxAttendees;
    }

    if (Object.keys(updates).length > 0) {
      const blocklist = await getBlocklist(ctx);
      const moderation = moderateContent(
        (updates.title as string) || event.title,
        (updates.description as string) || event.description,
        blocklist
      );

      if (moderation.status === "rejected") {
        throw new Error(
          "Your update contains content that violates our community guidelines."
        );
      }

      await ctx.db.patch(args.eventId, updates);
    }
  },
});

export const deleteEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    if (event.organizerId !== user._id && !isAdmin) {
      throw new Error("Only the event organizer or a site admin can delete this event");
    }

    const attendees = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
      .collect();

    for (const attendee of attendees) {
      await ctx.db.delete(attendee._id);
    }

    await ctx.db.delete(args.eventId);
  },
});

export const rsvpEvent = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event || event.status !== "active") throw new Error("Event not found");

    if (event.date < Date.now()) {
      throw new Error("This event has already passed");
    }

    const existing = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    if (existing) throw new Error("You are already attending this event");

    if (event.maxAttendees) {
      const attendeeCount = (
        await ctx.db
          .query("eventAttendees")
          .withIndex("by_event", (q) => q.eq("eventId", args.eventId))
          .collect()
      ).length;

      if (attendeeCount >= event.maxAttendees) {
        throw new Error("This event is full");
      }
    }

    await ctx.db.insert("eventAttendees", {
      eventId: args.eventId,
      userId: user._id,
      status: "going",
      joinedAt: Date.now(),
    });
  },
});

export const cancelRsvp = mutation({
  args: { eventId: v.id("events") },
  handler: async (ctx, args) => {
    const user = await getAuthenticatedUser(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) throw new Error("Event not found");

    if (event.organizerId === user._id) {
      throw new Error("Event organizer cannot cancel RSVP. Delete the event instead.");
    }

    const attendance = await ctx.db
      .query("eventAttendees")
      .withIndex("by_event_and_user", (q) =>
        q.eq("eventId", args.eventId).eq("userId", user._id)
      )
      .first();

    if (!attendance) throw new Error("You are not attending this event");

    await ctx.db.delete(attendance._id);
  },
});
