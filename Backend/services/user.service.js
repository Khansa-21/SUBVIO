import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import HttpError from "../utils/httpError.js";

export const isTransactionUnsupported = (error) =>
  error?.code === 20 ||
  /transaction numbers are only allowed|replica set member|transactions are not supported/i.test(
    error?.message || "",
  );

export const deleteUserAndSubscriptions = async (userId, session) => {
  const sessionOptions = session ? { session } : {};
  const userQuery = User.findById(userId);

  if (session) {
    userQuery.session(session);
  }

  const user = await userQuery;

  if (!user) {
    throw new HttpError(404, "User not found");
  }

  await Subscription.deleteMany({ user: user._id }, sessionOptions);
  await User.deleteOne({ _id: user._id }, sessionOptions);

  return user;
};
