import { calendarConfigured, createCalendarEvent } from "@/lib/googleCalendar";

export async function POST(request: Request): Promise<Response> {
  if (!calendarConfigured()) {
    return Response.json({ error: "Google Calendar not configured" }, { status: 503 });
  }

  const { summary, description, start, end, attendees } = await request.json();
  if (!summary || !start) {
    return Response.json({ error: "summary and start required" }, { status: 400 });
  }

  const endTime = end ?? new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString();

  try {
    const result = await createCalendarEvent({
      summary,
      description,
      start,
      end: endTime,
      attendees,
    });
    return Response.json({ created: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "calendar event failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
