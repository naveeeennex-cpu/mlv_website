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

export async function sendInteractiveButtons(phoneNumberId, accessToken, to, { body, buttons, imageUrl }) {
  const interactive = {
    type: 'button',
    body: { text: body },
    action: {
      buttons: buttons.map((b, i) => ({
        type: 'reply',
        reply: { id: b.id || `btn_${i}`, title: b.title.substring(0, 20) },
      })),
    },
  };

  if (imageUrl) {
    interactive.header = { type: 'image', image: { link: imageUrl } };
  }

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
      interactive,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp button error:', err);
  }
  return res;
}

export async function sendImage(phoneNumberId, accessToken, to, imageId, caption) {
  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { id: imageId, caption: caption || '' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp image send error:', err);
  }
  return res;
}

export async function sendImageUrl(phoneNumberId, accessToken, to, imageUrl, caption) {
  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'image',
      image: { link: imageUrl, caption: caption || '' },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp image URL send error:', err);
  }
  return res;
}

export async function sendCarousel(phoneNumberId, accessToken, to, { body, cards }) {
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
        type: 'carousel',
        body: { text: body },
        action: {
          sections: [{ cards }],
        },
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp carousel error:', err);
  }
  return res;
}

export async function sendTemplate(phoneNumberId, accessToken, to, templateName, languageCode = 'en', bodyParams = []) {
  const components = [];
  if (bodyParams.length > 0) {
    components.push({
      type: 'body',
      parameters: bodyParams.map(text => ({ type: 'text', text })),
    });
  }

  const res = await fetch(`${GRAPH_API}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: {
        name: templateName,
        language: { code: languageCode },
        components,
      },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('WhatsApp template error:', err);
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
