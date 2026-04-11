import { chatWithAI } from '@/actions/ai'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return Response.json(
        { error: 'Le champ "messages" est requis et doit etre un tableau non vide.' },
        { status: 400 }
      )
    }

    for (const msg of body.messages) {
      if (!msg.role || !msg.content || !['user', 'assistant'].includes(msg.role)) {
        return Response.json(
          { error: 'Chaque message doit avoir un "role" (user/assistant) et un "content".' },
          { status: 400 }
        )
      }
    }

    const response = await chatWithAI(body.messages)

    return Response.json({ response })
  } catch {
    return Response.json(
      { error: 'Erreur interne du serveur.' },
      { status: 500 }
    )
  }
}
