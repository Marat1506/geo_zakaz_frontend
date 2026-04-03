/**
 * Sound notification utility using Web Audio API
 * No external files needed — all sounds are generated programmatically
 */

type SoundType =
  | 'order_placed'       // Customer: order successfully placed
  | 'order_received'     // Seller/Admin: new order arrived
  | 'status_preparing'   // Customer: order is being prepared
  | 'status_on_the_way'  // Customer: order is on the way
  | 'status_delivered'   // Customer: order delivered
  | 'status_cancelled'   // Customer/Seller: order cancelled
  | 'cart_add'           // Customer: item added to cart
  | 'success'            // Generic success
  | 'error';             // Generic error

function getAudioContext(): AudioContext | null {
  try {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  } catch {
    return null;
  }
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume = 0.3,
  type: OscillatorType = 'sine',
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

export function playSound(type: SoundType): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;

  switch (type) {
    // 🛒 Cart add — short soft pop
    case 'cart_add':
      playTone(ctx, 880, t, 0.08, 0.15, 'sine');
      playTone(ctx, 1100, t + 0.08, 0.1, 0.1, 'sine');
      break;

    // ✅ Order placed — ascending success chime
    case 'order_placed':
      playTone(ctx, 523, t, 0.15, 0.25);       // C5
      playTone(ctx, 659, t + 0.15, 0.15, 0.25); // E5
      playTone(ctx, 784, t + 0.3, 0.25, 0.3);   // G5
      playTone(ctx, 1047, t + 0.5, 0.4, 0.35);  // C6
      break;

    // 🔔 New order received — urgent double beep (seller/admin)
    case 'order_received':
      playTone(ctx, 880, t, 0.15, 0.4, 'square');
      playTone(ctx, 880, t + 0.25, 0.15, 0.4, 'square');
      playTone(ctx, 1100, t + 0.5, 0.25, 0.45, 'square');
      break;

    // 🍳 Preparing — warm low tone
    case 'status_preparing':
      playTone(ctx, 440, t, 0.2, 0.2);
      playTone(ctx, 550, t + 0.2, 0.3, 0.25);
      break;

    // 🚗 On the way — two rising tones
    case 'status_on_the_way':
      playTone(ctx, 600, t, 0.15, 0.25);
      playTone(ctx, 800, t + 0.2, 0.15, 0.25);
      playTone(ctx, 1000, t + 0.4, 0.25, 0.3);
      break;

    // 🎉 Delivered — celebratory arpeggio
    case 'status_delivered':
      [523, 659, 784, 1047, 1319].forEach((freq, i) => {
        playTone(ctx, freq, t + i * 0.1, 0.15, 0.3);
      });
      break;

    // ❌ Cancelled — descending sad tones
    case 'status_cancelled':
      playTone(ctx, 440, t, 0.2, 0.25);
      playTone(ctx, 370, t + 0.2, 0.2, 0.25);
      playTone(ctx, 294, t + 0.4, 0.35, 0.3);
      break;

    // ✅ Generic success
    case 'success':
      playTone(ctx, 660, t, 0.12, 0.25);
      playTone(ctx, 880, t + 0.15, 0.2, 0.3);
      break;

    // ❌ Generic error
    case 'error':
      playTone(ctx, 300, t, 0.15, 0.3, 'sawtooth');
      playTone(ctx, 250, t + 0.2, 0.25, 0.3, 'sawtooth');
      break;
  }
}
