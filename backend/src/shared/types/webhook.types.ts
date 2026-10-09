export interface ClerkEmailAddress {
  id: string;
  email_address: string;
  verification?: {
    status: string;
  } | null;
}

export interface ClerkUserData {
  id: string;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  image_url?: string | null;
  profile_image_url?: string | null;
  email_addresses?: ClerkEmailAddress[];
  primary_email_address_id?: string | null;
}

export interface ClerkUserDeletedData {
  id: string;
  deleted?: boolean;
}

export interface ExtractedUserData {
  clerkId: string;
  username: string;
  email: string | null;
  avatarUrl: string | null;
}

export type ClerkWebhookEvent =
  | {
      type: "user.created";
      data: ClerkUserData;
      object: "event";
    }
  | {
      type: "user.updated";
      data: ClerkUserData;
      object: "event";
    }
  | {
      type: "user.deleted";
      data: ClerkUserDeletedData;
      object: "event";
    }
  | {
      type: string;
      data: Record<string, unknown>;
      object: string;
    };
