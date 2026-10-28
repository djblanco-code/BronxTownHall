/**
 * Optional availability status for programs with limited capacity
 * (childcare, housing/shelter, and any waitlisted program).
 *
 * A listing without this field shows no badge at all — we never guess a
 * status, because "Accepting now" on a full program wastes a resident's trip.
 */
export type AvailabilityStatus = "accepting" | "waitlist" | "full";

export const AVAILABILITY_KEYS: Record<AvailabilityStatus, string> = {
  accepting: "listing.availAccepting",
  waitlist: "listing.availWaitlist",
  full: "listing.availFull",
};

/** Badge colours mirror the existing Open now / Closed treatment. */
export const AVAILABILITY_CLASS: Record<AvailabilityStatus, string> = {
  accepting: "bg-success/15 text-success",
  waitlist: "bg-warning/20 text-warning",
  full: "bg-destructive/15 text-destructive",
};

export function toAvailabilityStatus(v: unknown): AvailabilityStatus | undefined {
  return v === "accepting" || v === "waitlist" || v === "full" ? v : undefined;
}

/** Categories where the field is offered in admin tools. */
export const AVAILABILITY_CATEGORIES = ["childcare", "housing", "youth", "education"];
