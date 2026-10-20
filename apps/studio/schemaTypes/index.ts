// Objects
import { seo } from "./objects/seo";
import { legacy } from "./objects/legacy";
import { youtube } from "./objects/youtube";
import { callout } from "./objects/callout";
import { adSlot } from "./objects/adSlot";
import { blockContent } from "./objects/blockContent";

// Documents
import { post } from "./documents/post";
import { page } from "./documents/page";
import { author } from "./documents/author";
import { category } from "./documents/category";
import { tag } from "./documents/tag";
import { event } from "./documents/event";
import { publication } from "./documents/publication";
import { redirect } from "./documents/redirect";
import { siteSettings } from "./documents/siteSettings";

export const schemaTypes = [
  // Objects
  seo,
  legacy,
  youtube,
  callout,
  adSlot,
  blockContent,

  // Documents
  post,
  page,
  author,
  category,
  tag,
  event,
  publication,
  redirect,
  siteSettings,
];
