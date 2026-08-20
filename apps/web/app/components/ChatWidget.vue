<script setup lang="ts">
import { X, Send } from 'lucide-vue-next'

interface ChatMessage {
  id: number
  role: 'bot' | 'user'
  text: string
  time: string
}

const isOpen = ref(false)
const draft = ref('')
const messageListEl = ref<HTMLElement | null>(null)

function nowLabel(): string {
  return new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

const messages = ref<ChatMessage[]>([
  {
    id: 1,
    role: 'bot',
    text: 'Halo! Saya Asisten Desa Sukarama. Ada yang bisa saya bantu hari ini?',
    time: nowLabel(),
  },
])

function togglePanel() {
  isOpen.value = !isOpen.value
}

function scrollToBottom() {
  nextTick(() => {
    if (messageListEl.value) {
      messageListEl.value.scrollTop = messageListEl.value.scrollHeight
    }
  })
}

// Catatan: balasan bot di bawah ini hanya placeholder tampilan,
// belum terhubung ke logika/AI backend sungguhan.
function sendMessage() {
  const text = draft.value.trim()
  if (!text) return

  messages.value.push({
    id: Date.now(),
    role: 'user',
    text,
    time: nowLabel(),
  })
  draft.value = ''
  scrollToBottom()

  setTimeout(() => {
    messages.value.push({
      id: Date.now() + 1,
      role: 'bot',
      text: 'Terima kasih atas pesan Anda. Tim kami akan segera menindaklanjuti.',
      time: nowLabel(),
    })
    scrollToBottom()
  }, 600)
}
</script>

<template>
  <div>
    <!-- Floating Action Button -->
    <div class="fixed bottom-6 right-6 z-50">
      <button
        class="relative w-16 h-16 flex items-center justify-center active:scale-95 hover:scale-105 transition-all duration-200"
        :aria-label="isOpen ? 'Tutup chat' : 'Buka chat asisten'"
        @click="togglePanel"
      >
        <X v-if="isOpen" class="w-8 h-8 text-emerald-900 drop-shadow-md" />
        <img v-else src="/images/chatbot-icon.png" alt="Asisten Desa" class="w-16 h-16 object-contain drop-shadow-lg" />
        <span
          v-if="!isOpen"
          class="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-amber-500 border-2 border-white"
        ></span>
      </button>
    </div>

    <!-- Chat Panel -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out origin-bottom-right"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-150 ease-in origin-bottom-right"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="isOpen"
          class="fixed bottom-24 right-6 z-50 w-[440px] max-w-[calc(100vw-2rem)] h-[680px] max-h-[calc(100vh-6rem)] bg-white rounded-3xl shadow-2xl shadow-slate-950/20 border border-slate-200/80 flex flex-col overflow-hidden"
        >
          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-white flex items-center justify-center border border-slate-200 overflow-hidden">
                <img src="/images/chatbot-icon.png" alt="Asisten Desa" class="w-7 h-7 object-contain" />
              </div>
              <div>
                <div class="font-bold text-slate-900 text-sm">Asisten Desa</div>
                <div class="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Online
                </div>
              </div>
            </div>
            <button
              class="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 transition-colors"
              aria-label="Tutup chat"
              @click="isOpen = false"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Message list -->
          <div ref="messageListEl" class="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/40">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="flex flex-col"
              :class="msg.role === 'user' ? 'items-end' : 'items-start'"
            >
              <div
                class="max-w-[80%] px-4 py-2.5 text-sm shadow-sm"
                :class="msg.role === 'user'
                  ? 'bg-white border border-slate-300 text-slate-800 rounded-2xl rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-2xl rounded-tl-sm'"
              >
                {{ msg.text }}
              </div>
              <span class="text-[10px] text-slate-400 mt-1">{{ msg.time }}</span>
            </div>
          </div>

          <!-- Input row -->
          <div class="border-t border-slate-100 p-3 flex items-center gap-2 bg-white">
            <input
              v-model="draft"
              type="text"
              placeholder="Ketik pesan..."
              class="flex-1 bg-slate-100 border border-transparent focus:border-emerald-300 focus:bg-white focus:outline-none rounded-full px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 transition-colors"
              @keyup.enter="sendMessage"
            />
            <button
              class="w-10 h-10 shrink-0 rounded-full bg-white border border-slate-300 hover:bg-slate-50 disabled:bg-slate-200 disabled:text-slate-400 text-slate-800 flex items-center justify-center transition-colors"
              :disabled="!draft.trim()"
              aria-label="Kirim pesan"
              @click="sendMessage"
            >
              <Send class="w-4 h-4" />
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
