import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Section = "devices" | "connect" | "settings" | "status" | "help";

interface Device {
  id: string;
  name: string;
  type: "printer" | "scanner" | "keyboard" | "headset" | "monitor";
  status: "connected" | "disconnected" | "pairing";
  signal: number;
  address: string;
  lastSeen: string;
}

interface FoundDevice {
  id: string;
  name: string;
  type: "printer" | "scanner" | "keyboard" | "headset" | "monitor";
  signal: number;
  address: string;
}

const INITIAL_DEVICES: Device[] = [
  { id: "1", name: "HP LaserJet Pro M404n", type: "printer", status: "connected", signal: 92, address: "A4:C3:F0:12:45:BE", lastSeen: "Сейчас" },
  { id: "2", name: "Logitech MX Keys", type: "keyboard", status: "connected", signal: 87, address: "DE:AD:BE:EF:11:22", lastSeen: "Сейчас" },
  { id: "3", name: "Canon DR-S130", type: "scanner", status: "disconnected", signal: 0, address: "B2:F1:9A:33:77:CC", lastSeen: "2 часа назад" },
  { id: "4", name: "Sony WH-1000XM5", type: "headset", status: "pairing", signal: 65, address: "F0:1D:2C:AB:88:41", lastSeen: "5 мин назад" },
];

const FOUND_DEVICES: FoundDevice[] = [
  { id: "f1", name: "Zebra ZD421", type: "printer", signal: 78, address: "C1:E2:F3:04:55:AA" },
  { id: "f2", name: "BenQ PD2725U", type: "monitor", signal: 91, address: "AA:BB:CC:DD:EE:FF" },
  { id: "f3", name: "Jabra Evolve2 85", type: "headset", signal: 64, address: "11:22:33:44:55:66" },
];

const deviceIcon: Record<string, string> = {
  printer: "Printer",
  scanner: "ScanLine",
  keyboard: "Keyboard",
  headset: "Headphones",
  monitor: "Monitor",
};

const deviceLabel: Record<string, string> = {
  printer: "Принтер",
  scanner: "Сканер",
  keyboard: "Клавиатура",
  headset: "Гарнитура",
  monitor: "Монитор",
};

function StatusBadge({ status }: { status: Device["status"] }) {
  const config = {
    connected: { label: "Подключено", color: "text-success", dot: "bg-success" },
    disconnected: { label: "Отключено", color: "text-muted-foreground", dot: "bg-muted-foreground" },
    pairing: { label: "Сопряжение...", color: "text-warning", dot: "bg-warning animate-pulse-dot" },
  };
  const c = config[status];
  return (
    <span className={`flex items-center gap-1.5 text-xs font-medium ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function SignalBar({ value }: { value: number }) {
  const bars = [25, 50, 75, 100];
  return (
    <div className="flex items-end gap-0.5">
      {bars.map((threshold, i) => (
        <div
          key={i}
          className={`w-1 rounded-sm transition-colors ${value >= threshold ? "bg-primary" : "bg-muted"}`}
          style={{ height: `${6 + i * 3}px` }}
        />
      ))}
    </div>
  );
}

interface DevicesSectionProps {
  devices: Device[];
  onConnect: (id: string) => void;
  onDisconnectAll: () => void;
  onDelete: (id: string) => void;
}

function DevicesSection({ devices, onConnect, onDisconnectAll, onDelete }: DevicesSectionProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleConnect = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConnecting(id);
    setTimeout(() => {
      onConnect(id);
      setConnecting(null);
    }, 2000);
  };

  const handleDisconnectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDisconnectAll();
    setSelected(null);
  };

  const handleDeleteRequest = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmDelete(id);
  };

  const handleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      onDelete(confirmDelete);
      setSelected(null);
      setConfirmDelete(null);
    }
  };

  const handleDeleteCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDelete(null);
  };

  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Мои устройства</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {devices.filter(d => d.status === "connected").length} из {devices.length} подключено
          </p>
        </div>
        {devices.some(d => d.status === "connected") && (
          <button
            onClick={handleDisconnectAll}
            className="flex items-center gap-2 text-xs text-danger border border-danger/30 hover:border-danger/60 px-3 py-1.5 rounded transition-colors"
          >
            <Icon name="BluetoothOff" size={12} />
            Отключить все
          </button>
        )}
      </div>

      {devices.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          <Icon name="Cpu" size={32} className="mx-auto mb-3 opacity-30" />
          <p>Устройств нет. Добавьте их через «Подключение».</p>
        </div>
      )}

      <div className="space-y-2">
        {devices.map((device, i) => (
          <div
            key={device.id}
            onClick={() => setSelected(selected === device.id ? null : device.id)}
            className="border border-border rounded cursor-pointer hover:border-primary/40 transition-all"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-center gap-4 p-4">
              <div className={`w-10 h-10 rounded flex items-center justify-center shrink-0 ${
                device.status === "connected" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>
                {connecting === device.id ? (
                  <Icon name="Loader" size={18} className="animate-spin text-primary" />
                ) : (
                  <Icon name={deviceIcon[device.type]} size={18} fallback="Cpu" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{device.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{deviceLabel[device.type]}</span>
                </div>
                <div className="flex items-center gap-3 mt-1">
                  {connecting === device.id
                    ? <span className="text-xs text-warning flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse-dot" />Распознавание...</span>
                    : <StatusBadge status={device.status} />
                  }
                  <span className="text-xs text-muted-foreground font-mono">{device.address}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {device.status === "connected" && <SignalBar value={device.signal} />}
                <Icon name={selected === device.id ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground" />
              </div>
            </div>

            {selected === device.id && (
              <div className="border-t border-border px-4 py-3 bg-muted/20">
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-muted-foreground mb-1">Последнее подключение</p>
                    <p className="font-medium">{device.lastSeen}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">Уровень сигнала</p>
                    <p className="font-medium">{device.signal > 0 ? `${device.signal}%` : "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-1">MAC-адрес</p>
                    <p className="font-mono font-medium">{device.address}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {device.status === "connected" ? (
                    <button
                      onClick={(e) => handleDisconnectAll(e)}
                      className="text-xs border border-border hover:border-danger/50 hover:text-danger px-3 py-1.5 rounded transition-colors"
                    >
                      Отключить
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleConnect(e, device.id)}
                      disabled={connecting === device.id}
                      className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 px-3 py-1.5 rounded transition-colors"
                    >
                      {connecting === device.id ? "Распознавание..." : "Подключить"}
                    </button>
                  )}
                  {confirmDelete === device.id ? (
                    <div className="flex items-center gap-2 animate-fade-in-up">
                      <span className="text-xs text-muted-foreground">Удалить?</span>
                      <button
                        onClick={handleDeleteConfirm}
                        className="text-xs bg-danger text-white hover:bg-danger/90 px-3 py-1.5 rounded transition-colors"
                      >
                        Да
                      </button>
                      <button
                        onClick={handleDeleteCancel}
                        className="text-xs border border-border hover:border-border/80 px-3 py-1.5 rounded transition-colors text-muted-foreground hover:text-foreground"
                      >
                        Отмена
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => handleDeleteRequest(e, device.id)}
                      className="text-xs border border-border hover:border-danger/40 hover:text-danger px-3 py-1.5 rounded transition-colors text-muted-foreground"
                    >
                      Удалить
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface ConnectSectionProps {
  devices: Device[];
  onAddDevice: (device: Device) => void;
}

function ConnectSection({ devices, onAddDevice }: ConnectSectionProps) {
  const [scanning, setScanning] = useState(false);
  const [found, setFound] = useState<FoundDevice[]>([]);
  const [progress, setProgress] = useState(0);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);

  const startScan = () => {
    setScanning(true);
    setFound([]);
    setProgress(0);
    setConnected([]);

    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return p + 2;
      });
    }, 60);

    FOUND_DEVICES.forEach((d, i) => {
      setTimeout(() => setFound(prev => [...prev, d]), 1200 + i * 800);
    });
  };

  const handleConnect = (device: FoundDevice) => {
    if (connected.includes(device.id)) return;
    setConnecting(device.id);
    setTimeout(() => {
      const newDevice: Device = {
        id: device.id,
        name: device.name,
        type: device.type,
        status: "connected",
        signal: device.signal,
        address: device.address,
        lastSeen: "Сейчас",
      };
      onAddDevice(newDevice);
      setConnecting(null);
      setConnected(prev => [...prev, device.id]);
    }, 2200);
  };

  const alreadyInList = (id: string) => devices.some(d => d.id === id);

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Подключение</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Поиск устройств через Bluetooth</p>
      </div>

      <div className="border border-border rounded p-8 flex flex-col items-center mb-6">
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {scanning && (
            <>
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping-slow" />
              <div className="absolute inset-2 rounded-full border-2 border-primary/30 animate-ping-medium" />
            </>
          )}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            scanning ? "bg-primary/15 border-2 border-primary/50" : "bg-muted border-2 border-border"
          }`}>
            <Icon name="Bluetooth" size={28} className={scanning ? "text-primary" : "text-muted-foreground"} />
          </div>
        </div>

        {scanning ? (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Сканирование...</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {found.length > 0 ? `Найдено ${found.length} устройства` : "Нажмите для поиска устройств поблизости"}
            </p>
            <button
              onClick={startScan}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              {found.length > 0 ? "Сканировать снова" : "Начать поиск"}
            </button>
          </div>
        )}
      </div>

      {found.length > 0 && (
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Обнаруженные устройства</p>
          <div className="space-y-2">
            {found.map((device, i) => {
              const isConnecting = connecting === device.id;
              const isConnected = connected.includes(device.id) || alreadyInList(device.id);
              return (
                <div
                  key={device.id}
                  className="flex items-center gap-4 p-4 border border-border rounded animate-slide-in hover:border-primary/30 transition-colors"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`w-9 h-9 rounded flex items-center justify-center shrink-0 ${
                    isConnected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  }`}>
                    {isConnecting
                      ? <Icon name="Loader" size={16} className="animate-spin text-primary" />
                      : <Icon name={deviceIcon[device.type]} size={16} fallback="Cpu" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{device.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{device.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <SignalBar value={device.signal} />
                    {isConnected ? (
                      <span className="text-xs text-success flex items-center gap-1">
                        <Icon name="Check" size={12} />
                        Добавлено
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConnect(device)}
                        disabled={isConnecting}
                        className="text-xs border border-primary/40 text-primary hover:bg-primary/10 disabled:opacity-60 px-3 py-1.5 rounded transition-colors"
                      >
                        {isConnecting ? "Распознавание..." : "Подключить"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

interface StatusSectionProps {
  devices: Device[];
}

function StatusSection({ devices }: StatusSectionProps) {
  const connected = devices.filter(d => d.status === "connected");
  const logs = [
    { time: "09:42:11", level: "info", msg: "HP LaserJet Pro M404n — подключено" },
    { time: "09:38:05", level: "info", msg: "Logitech MX Keys — подключено" },
    { time: "09:35:22", level: "warn", msg: "Sony WH-1000XM5 — запрос сопряжения" },
    { time: "08:10:44", level: "error", msg: "Canon DR-S130 — соединение разорвано" },
    { time: "07:58:01", level: "info", msg: "Система Bluetooth инициализирована" },
  ];

  const logColor: Record<string, string> = {
    info: "text-muted-foreground",
    warn: "text-warning",
    error: "text-danger",
  };

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Статус системы</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Мониторинг подключений в реальном времени</p>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Подключено", value: connected.length, icon: "Link", color: "text-success" },
          { label: "Всего устройств", value: devices.length, icon: "Cpu", color: "text-primary" },
          { label: "Bluetooth", value: "Активен", icon: "Bluetooth", color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="border border-border rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name={stat.icon} size={14} className={stat.color} fallback="Activity" />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className={`text-2xl font-semibold tracking-tight ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="border border-border rounded overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Журнал событий</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
            <span className="text-xs text-muted-foreground">Live</span>
          </div>
        </div>
        <div className="divide-y divide-border">
          {logs.map((log, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-2.5 text-xs">
              <span className="font-mono text-muted-foreground shrink-0">{log.time}</span>
              <span className={`w-1 h-1 rounded-full shrink-0 ${
                log.level === "info" ? "bg-muted-foreground" : log.level === "warn" ? "bg-warning" : "bg-danger"
              }`} />
              <span className={logColor[log.level]}>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SettingsSection() {
  const [bt, setBt] = useState(true);
  const [autoConnect, setAutoConnect] = useState(true);
  const [notifications, setNotifications] = useState(false);
  const [energy, setEnergy] = useState(false);

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors shrink-0 ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${value ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  );

  const settings = [
    { label: "Bluetooth", desc: "Включить адаптер Bluetooth", value: bt, onChange: () => setBt(!bt) },
    { label: "Автоподключение", desc: "Подключаться к известным устройствам автоматически", value: autoConnect, onChange: () => setAutoConnect(!autoConnect) },
    { label: "Уведомления", desc: "Push-уведомления о статусе устройств", value: notifications, onChange: () => setNotifications(!notifications) },
    { label: "Режим экономии", desc: "Снизить частоту сканирования для экономии батареи", value: energy, onChange: () => setEnergy(!energy) },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Настройки</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Параметры подключения и системы</p>
      </div>

      <div className="border border-border rounded divide-y divide-border mb-4">
        {settings.map((s) => (
          <div key={s.label} className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm font-medium">{s.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
            <Toggle value={s.value} onChange={s.onChange} />
          </div>
        ))}
      </div>

      <div className="border border-border rounded p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Версия приложения</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">DevConnect</p>
            <p className="text-xs font-mono text-muted-foreground">v1.0.0 · Build 20260402</p>
          </div>
          <button className="text-xs text-primary border border-primary/30 hover:border-primary/60 px-3 py-1.5 rounded transition-colors">
            Проверить обновления
          </button>
        </div>
      </div>
    </div>
  );
}

function HelpSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      q: "Как подключить новое устройство?",
      a: "Перейдите в раздел «Подключение» и нажмите «Начать поиск». Устройство должно находиться в режиме обнаружения. После обнаружения нажмите «Подключить» и подтвердите сопряжение.",
    },
    {
      q: "Устройство не обнаруживается при сканировании",
      a: "Убедитесь, что устройство включено и Bluetooth активен. Проверьте, что устройство находится в радиусе 10 метров. Попробуйте перезапустить Bluetooth в настройках.",
    },
    {
      q: "Как удалить устройство из списка?",
      a: "Откройте раздел «Устройства», нажмите на нужное устройство для раскрытия деталей и выберите «Удалить». Подтвердите действие.",
    },
    {
      q: "Что означает статус «Сопряжение»?",
      a: "Статус означает, что устройство пытается установить защищённое соединение. Обычно это занимает несколько секунд. Если процесс завис — отключите и включите устройство заново.",
    },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Помощь</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Часто задаваемые вопросы</p>
      </div>

      <div className="border border-border rounded divide-y divide-border mb-4">
        {faqs.map((faq, i) => (
          <div key={i}>
            <button
              className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/20 transition-colors"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <span className="text-sm font-medium pr-4">{faq.q}</span>
              <Icon name={openIdx === i ? "ChevronUp" : "ChevronDown"} size={14} className="text-muted-foreground shrink-0" />
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed animate-fade-in-up">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="border border-border rounded p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Icon name="MessageCircle" size={18} />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Служба поддержки</p>
          <p className="text-xs text-muted-foreground">Понедельник — пятница, 9:00–18:00</p>
        </div>
        <button className="text-xs bg-primary text-primary-foreground hover:bg-primary/90 px-3 py-1.5 rounded transition-colors">
          Написать
        </button>
      </div>
    </div>
  );
}

const NAV_ITEMS: { id: Section; label: string; icon: string }[] = [
  { id: "devices", label: "Устройства", icon: "Cpu" },
  { id: "connect", label: "Подключение", icon: "Bluetooth" },
  { id: "status", label: "Статус", icon: "Activity" },
  { id: "settings", label: "Настройки", icon: "Settings" },
  { id: "help", label: "Помощь", icon: "HelpCircle" },
];

export default function Index() {
  const [active, setActive] = useState<Section>("devices");
  const [time, setTime] = useState(new Date());
  const [devices, setDevices] = useState<Device[]>(INITIAL_DEVICES);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleConnect = (id: string) => {
    setDevices(prev => prev.map(d =>
      d.id === id
        ? { ...d, status: "connected", signal: Math.floor(60 + Math.random() * 35), lastSeen: "Сейчас" }
        : d
    ));
  };

  const handleDisconnectAll = () => {
    setDevices(prev => prev.map(d =>
      d.status === "connected"
        ? { ...d, status: "disconnected", signal: 0, lastSeen: "Только что" }
        : d
    ));
  };

  const handleDelete = (id: string) => {
    setDevices(prev => prev.filter(d => d.id !== id));
  };

  const handleAddDevice = (device: Device) => {
    setDevices(prev => {
      if (prev.some(d => d.id === device.id)) return prev;
      return [...prev, device];
    });
  };

  const renderSection = () => {
    switch (active) {
      case "devices":
        return <DevicesSection devices={devices} onConnect={handleConnect} onDisconnectAll={handleDisconnectAll} onDelete={handleDelete} />;
      case "connect":
        return <ConnectSection devices={devices} onAddDevice={handleAddDevice} />;
      case "status":
        return <StatusSection devices={devices} />;
      case "settings":
        return <SettingsSection />;
      case "help":
        return <HelpSection />;
    }
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col max-w-sm mx-auto relative">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center">
              <Icon name="Bluetooth" size={14} className="text-white" />
            </div>
            <span className="text-sm font-semibold tracking-tight">DevConnect</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-muted-foreground">
              {time.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-dot" />
              <span className="text-xs text-muted-foreground">BT</span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-5 overflow-y-auto">
        {renderSection()}
      </main>

      <nav className="border-t border-border bg-background/95 backdrop-blur-sm sticky bottom-0">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`relative flex flex-col items-center gap-1 py-3 transition-colors ${
                active === item.id
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon name={item.icon} size={18} fallback="Circle" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
              {active === item.id && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-t" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}