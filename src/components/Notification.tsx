/** @format */

import toast from "react-hot-toast";

export default function Notification(type: string, message: string) {
  switch (type) {
    case "success":
      return toast.success(message);
    case "error":
      return toast.error(message);
    case "loading":
      return toast.loading("Loading...");
    default:
      return toast(message);
  }
}
