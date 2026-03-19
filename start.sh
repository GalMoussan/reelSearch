#!/bin/sh
# Starts both the BullMQ worker and Telegram bot as sibling processes.
# If either process exits (crash or clean stop), both are killed so the
# container restarts cleanly rather than running half-dead.

set -e

echo "[start] Launching reel-processor worker..."
npx tsx src/workers/reel-processor.ts &
WORKER_PID=$!

echo "[start] Launching Telegram bot..."
npx tsx src/telegram/bot.ts &
BOT_PID=$!

# Forward SIGTERM / SIGINT to both children so they can shut down gracefully
# (each script already handles these signals internally)
trap "echo '[start] Shutting down...'; kill $WORKER_PID $BOT_PID 2>/dev/null; wait $WORKER_PID $BOT_PID 2>/dev/null; exit 0" SIGTERM SIGINT

echo "[start] Both processes running. worker PID=$WORKER_PID  bot PID=$BOT_PID"

# Block until the first child exits, then kill the other
wait $WORKER_PID
WORKER_EXIT=$?
echo "[start] Worker exited with code $WORKER_EXIT — stopping bot"
kill $BOT_PID 2>/dev/null
wait $BOT_PID 2>/dev/null

exit $WORKER_EXIT
