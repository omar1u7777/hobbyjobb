import api from './api.js';

function normalizeConversation(item) {
  const otherUser = item.otherUser ?? item.participant ?? {};
  const lastMessage = item.lastMessage ?? {};

  return {
    id: item.id ?? `c-${item.jobId}-${otherUser.id ?? 'unknown'}`,
    jobId: String(item.jobId ?? item.job_id ?? ''),
    jobTitle: item.jobTitle ?? item.job_title ?? 'Okant jobb',
    participant: {
      id: otherUser.id,
      name: otherUser.name ?? 'Okand anvandare',
      avatar: otherUser.avatar ?? null,
    },
    unread: item.unreadCount ?? item.unread ?? 0,
    previewText: lastMessage.content ?? lastMessage.text ?? '',
    updatedAt: lastMessage.createdAt ?? lastMessage.created_at ?? item.updatedAt ?? new Date().toISOString(),
    messages: [],
  };
}

function normalizeMessage(item) {
  return {
    id: String(item.id),
    senderId: item.senderId ?? item.sender_id ?? item.sender?.id,
    text: item.text ?? item.content ?? '',
    sentAt: item.sentAt ?? item.createdAt ?? item.created_at ?? new Date().toISOString(),
  };
}

export const messageService = {
  async getConversations() {
    const { data } = await api.get('/messages/conversations');
    const raw = data.data?.conversations ?? data.conversations ?? [];
    return raw.map(normalizeConversation);
  },

  async getMessages(jobId) {
    const { data } = await api.get(`/messages/${jobId}`);
    const raw = data.data?.messages ?? data.messages ?? [];
    return raw.map(normalizeMessage);
  },

  async sendMessage({ jobId, receiverId, content }) {
    const { data } = await api.post('/messages', {
      job_id: Number(jobId),
      receiver_id: Number(receiverId),
      content,
    });

    const message = data.data?.message ?? data.message ?? data;
    return normalizeMessage(message);
  },

  async markConversationAsRead(jobId) {
    const { data } = await api.patch(`/messages/${jobId}/read`);
    return data.data?.updatedCount ?? 0;
  },

  async getUnreadCount() {
    const { data } = await api.get('/messages/unread-count');
    return data.data?.count ?? data.count ?? 0;
  },
};
