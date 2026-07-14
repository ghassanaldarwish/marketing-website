import assert from "node:assert/strict"
import test from "node:test"

import {
  createTelegramSender,
  TelegramDeliveryError,
} from "./telegram-client.mjs"

const configuration = {
  botToken: "test-token",
  chatId: "-123456789",
  requestTimeoutMs: 1_000,
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

test("resolves only after a successful Telegram response", async () => {
  const requests = []
  const sender = createTelegramSender(configuration, async (url, init) => {
    requests.push({ url, init })
    return jsonResponse({ ok: true })
  })

  await sender("visitor message")
  assert.equal(requests.length, 1)
})

test("sends plain text without parse_mode", async () => {
  let requestBody
  const sender = createTelegramSender(configuration, async (_url, init) => {
    requestBody = JSON.parse(String(init.body))
    return jsonResponse({ ok: true })
  })

  const message = "*bold* _italic_ [link](https://example.com)"
  await sender(message)

  assert.deepEqual(requestBody, {
    chat_id: configuration.chatId,
    text: message,
  })
  assert.equal("parse_mode" in requestBody, false)
})

for (const status of [400, 429, 500]) {
  test(`rejects HTTP ${status} with a typed redacted error`, async () => {
    const sender = createTelegramSender(configuration, async () =>
      jsonResponse({ ok: false }, status)
    )

    await assert.rejects(sender("private visitor content"), (error) => {
      assert.ok(error instanceof TelegramDeliveryError)
      assert.equal(error.code, "HTTP_ERROR")
      assert.equal(error.status, status)
      assert.doesNotMatch(error.message, /test-token|private visitor content/)
      return true
    })
  })
}

test("rejects network failures with a typed redacted error", async () => {
  const sender = createTelegramSender(configuration, async () => {
    throw new Error("network failure containing test-token")
  })

  await assert.rejects(sender("private visitor content"), (error) => {
    assert.equal(error.code, "NETWORK_ERROR")
    assert.doesNotMatch(error.message, /test-token|private visitor content/)
    return true
  })
})

test("rejects malformed responses", async () => {
  const sender = createTelegramSender(
    configuration,
    async () => new Response("not-json", { status: 200 })
  )

  await assert.rejects(sender("private visitor content"), {
    code: "MALFORMED_RESPONSE",
  })
})

test("rejects timeout failures", async () => {
  const sender = createTelegramSender(
    { ...configuration, requestTimeoutMs: 5 },
    async (_url, init) =>
      new Promise((_resolve, reject) => {
        init.signal.addEventListener(
          "abort",
          () => reject(new DOMException("Aborted", "AbortError")),
          { once: true }
        )
      })
  )

  await assert.rejects(sender("private visitor content"), {
    code: "TIMEOUT",
  })
})

test("rejects explicit Telegram API failures", async () => {
  const sender = createTelegramSender(configuration, async () =>
    jsonResponse({ ok: false, error_code: 400 })
  )

  await assert.rejects(sender("private visitor content"), {
    code: "API_REJECTED",
  })
})
