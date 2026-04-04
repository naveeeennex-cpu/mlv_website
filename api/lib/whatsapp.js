const GRAPH_API = 'https://graph.facebook.com/v22.0';

export async function sendText(phoneNumberId, accessToken, to, text) {
  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp send error:', err);
  }
  return res;
}

export async function sendInteractiveList(phoneNumberId, accessToken, to, { header, body, buttonText, sections }) {
  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: { type: 'text', text: header },
        body: { text: body },
        action: {
          button: buttonText,
          sections,
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp list error:', err);
  }
  return res;
}

export async function sendInteractiveButtons(phoneNumberId, accessToken, to, { body, buttons }) {
  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: { text: body },
        action: {
          buttons: buttons.map((b, i) => ({
            type: 'reply',
            reply: { id: b.id || `btn_${i}`, title: b.title.substring(0, 20) },
          })),
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp button error:', err);
  }
  return res;
}

export async function markAsRead(phoneNumberId, accessToken, messageId) {
  await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  }).catch(() => {});
}
