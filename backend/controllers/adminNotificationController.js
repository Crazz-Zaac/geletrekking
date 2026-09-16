const ContactMessage = require("../models/ContactMessage");
const BookingSubmission = require("../models/BookingSubmission");

const summarizeMessage = (message) => ({
  id: String(message._id),
  type: "message",
  title: "New message received",
  description: `${message.name || "A customer"} sent a message`,
  href: "/admin/messages",
  createdAt: message.createdAt,
});

const summarizeBooking = (booking) => ({
  id: String(booking._id),
  type: "booking",
  title: "New booking form submitted",
  description: `${[booking.firstName, booking.lastName].filter(Boolean).join(" ") || "A customer"} submitted a booking form`,
  href: "/admin/bookings",
  createdAt: booking.createdAt,
});

exports.getNotificationSummary = async (req, res) => {
  try {
    const [unreadMessages, unreadBookings, latestMessages, latestBookings] = await Promise.all([
      ContactMessage.countDocuments({ isRead: false }),
      BookingSubmission.countDocuments({ isRead: false }),
      ContactMessage.find({ isRead: false }).sort({ createdAt: -1 }).limit(5).select("name createdAt"),
      BookingSubmission.find({ isRead: false }).sort({ createdAt: -1 }).limit(5).select("firstName lastName createdAt"),
    ]);

    const items = [...latestMessages.map(summarizeMessage), ...latestBookings.map(summarizeBooking)]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    res.json({
      totalUnread: unreadMessages + unreadBookings,
      unreadMessages,
      unreadBookings,
      items,
    });
  } catch (err) {
    console.error("Notification summary error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
