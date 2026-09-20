import { register } from "./register.controller.js";
import { login } from "./login.controller.js";
import { logout } from "./logout.controller.js";
import { get_me } from "./own_profile.controller.js";
import { get_public_profile } from "./public_profile.controller.js";
import { update_profile } from "./update_profile.controller.js";
import { search_users } from "./search_users.controller.js";
import { add_friend, remove_friend } from "./add_friend.controller.js";
import { sync_messages, send_message } from "./sync_message.controller.js";

export {
  register,
  login,
  logout,
  get_me,
  get_public_profile,
  update_profile,
  search_users,
  add_friend,
  remove_friend,
  sync_messages,
  send_message,
};