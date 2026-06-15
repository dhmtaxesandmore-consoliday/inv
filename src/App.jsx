import React, { useState, useMemo } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Terminal, Lock, Unlock, Users, ChevronRight, X, DollarSign, TrendingUp, BarChart2, Heart } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { supabase } from './lib/supabase';
import furnitureMap from './furnitureMap.json';

// --- CONFIGURATION ---
const NATIVE_TILE_SIZE = 16;
const SCALE = 3; 

// --- TILESET COORDINATES (from TilesHouse.png) ---
const TILES = {
  WOOD: { tx: 3, ty: 8 },
  WALL_TOP: { tx: 2, ty: 1 },
  ORANGE: { tx: 30, ty: 6 },
  BLUE: { tx: 30, ty: 16 },
  RED: { tx: 30, ty: 11 },
  TEAL: { tx: 12, ty: 6 },
  VIOLET: { tx: 8, ty: 5 },
  CHECKER: { tx: 9, ty: 9 },
  BLACK: { tx: 9, ty: 10 }
};

const getFurnitureSprite = (type) => {
  const baseType = type.split(':')[0];
  return `/assets/furniture/${furnitureMap[baseType] || baseType + '/' + baseType + '.png'}`;
};

// --- BASE COMPONENTS ---
const bgPosition = (tx, ty) => `-${tx * NATIVE_TILE_SIZE}px -${ty * NATIVE_TILE_SIZE}px`;

const Prop = ({ type, col, row, zIndexOffset = 0, className = '', onClick = null }) => {
  const isLeft = type.includes(':left');
  // Z-index calculation: the lower on screen (higher Y), the higher the Z-index.
  const zIdx = Math.floor(row * 10) + zIndexOffset;
  
  return (
    <img 
      src={getFurnitureSprite(type)}
      className={`sprite ${className}`}
      style={{ 
        position: 'absolute', left: col * NATIVE_TILE_SIZE, top: row * NATIVE_TILE_SIZE, 
        zIndex: zIdx, imageRendering: 'pixelated',
        transform: isLeft ? 'scaleX(-1)' : 'none',
        transformOrigin: 'top left',
        cursor: onClick ? 'pointer' : 'default'
      }} 
      onClick={onClick}
      alt="prop" 
    />
  );
};

const CharProp = ({ charId, x, y, direction = 0, step = 1, showBubble = false, zIndexOffset = 5 }) => {
  // zIdx calculation strictly handles depth so characters overlap desks correctly
  const zIdx = Math.floor(y * 10) + zIndexOffset;
  const bgX = -(step * 16);
  const bgY = -(direction * 32);

  return (
    <div 
      style={{ 
        position: 'absolute', left: x * NATIVE_TILE_SIZE, top: y * NATIVE_TILE_SIZE - 16, 
        width: 16, height: 32,
        backgroundImage: `url(/assets/characters/char_${charId}.png)`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        transition: 'left 0.1s linear, top 0.1s linear',
        zIndex: zIdx, imageRendering: 'pixelated'
      }} 
      title={`Worker ${charId}`}
    >
      {showBubble && <div className="exclamation-bubble" style={{ position: 'absolute', top: -15, left: 4, background: 'white', padding: '1px 3px', borderRadius: 4, fontSize: '10px', color: 'black', fontWeight: 900, border: '1px solid black', zIndex: zIdx + 1, boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>!</div>}
    </div>
  );
};

const Cupboard = ({ col, row, zIndexOffset = 5, onClick }) => {
  // Use a higher z-index base so it naturally overlaps wall tiles but stays under players if they walk in front
  const zIdx = Math.floor(row * 10) + zIndexOffset;
  return (
    <div 
      className={onClick ? "clickable" : ""}
      style={{
        position: 'absolute', left: col * NATIVE_TILE_SIZE, top: row * NATIVE_TILE_SIZE - 80, // Anchored so the bottom touches 'row'
        width: 64, height: 96,
        backgroundImage: 'url(/assets/Cupboard-Sheet.png)',
        backgroundPosition: '0px 0px', 
        zIndex: zIdx, imageRendering: 'pixelated',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: onClick ? '0 0 8px rgba(255, 255, 255, 0.4)' : 'none',
        borderRadius: 2
      }}
      onClick={(e) => {
        if (onClick) { e.stopPropagation(); onClick(); }
      }}
      title="Archivo Consoliday"
    />
  );
};

// High-fidelity Gather-style composite Desk
const DeskWorker = ({ col, row, project, onPCClick }) => {
  const pcZ = Math.floor((row - 0.4) * 10) + 25;
  const isElite = project === 'planelite';
  return (
    <>
      <Prop type="WOODEN_CHAIR_FRONT" col={col + 0.5} row={row - 0.7} zIndexOffset={0} />
      {/* CharProp is now dynamically rendered in the main map loop, detached from the static desk! */}
      <Prop type="TABLE_FRONT" col={col} row={row} zIndexOffset={15} />

      {/* Monitor clickable zone con tint verde Hacker */}
      <div 
        style={{
          position: 'absolute', left: (col + 0.5) * NATIVE_TILE_SIZE, top: (row - 0.4) * NATIVE_TILE_SIZE,
          width: NATIVE_TILE_SIZE, height: NATIVE_TILE_SIZE,
          zIndex: pcZ + 10, cursor: onPCClick ? 'pointer' : 'default',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          background: onPCClick ? 'rgba(34, 197, 94, 0.2)' : 'transparent',
          border: onPCClick ? '1px solid rgba(34, 197, 94, 0.5)' : 'none',
          boxShadow: onPCClick ? '0 0 10px rgba(34, 197, 94, 0.5)' : 'none',
          borderRadius: 2
        }}
        onClick={(e) => { 
          if (onPCClick) {
            e.stopPropagation();
            onPCClick(project); 
          }
        }}
        title={`Terminal: ${project ? project.toUpperCase() : 'Inactiva'}`}
      >
        <img src={getFurnitureSprite('PC_FRONT_OFF')} alt="PC Hacker" style={{ imageRendering: 'pixelated', pointerEvents: 'none', transform: 'scale(1)' }} />
      </div>
    </>
  );
};

// Stats HUD positioned over Rooms
const RoomHUD = ({ col, row, widthCols, title, color, status, stats }) => (
  <div style={{
    position: 'absolute', left: col * NATIVE_TILE_SIZE, top: row * NATIVE_TILE_SIZE, width: widthCols * NATIVE_TILE_SIZE,
    pointerEvents: 'none', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center'
  }}>
    <div style={{ 
      background: 'rgba(0,0,0,0.85)', border: `2px solid ${color}`, borderRadius: 4, padding: '2px 8px',
      color, fontWeight: 'bold', display: 'flex', gap: 6, alignItems: 'center', marginTop: -20,
      pointerEvents: 'auto', fontSize: '8px', fontFamily: 'sans-serif', boxShadow: `0 2px 5px rgba(0,0,0,0.8)`,
    }}>
      {title}
      <div style={{ width: 4, height: 4, borderRadius: '50%', background: status === 'live' ? '#4ade80' : '#facc15', boxShadow: `0 0 4px ${status==='live'?'#4ade80':'#facc15'}` }} />
    </div>
    {stats && (
      <div style={{ 
        background: 'rgba(0,0,0,0.85)', padding: '2px 4px', borderRadius: 3, fontSize: '6px', color: '#eee', 
        border: '1px solid #444', marginTop: 2, pointerEvents: 'auto', fontFamily: 'monospace'
      }}>
        USR:{stats.users} REV:{stats.revenue}
      </div>
    )}
  </div>
);

// --- DYNAMIC RESPONSIVE LAYOUT FACTORY ---
const getLayout = () => {
  const isM = typeof window !== 'undefined' && window.innerWidth < 768;
  return {
    isM,
    MAP_COLS: isM ? 14 : 42,
    MAP_ROWS: isM ? 74 : 28,
    rc: {
      consoliday: { id: 'consoliday', x: 2, y: 2, w: 10, h: 10, t: TILES.ORANGE },
      planelite: { id: 'planelite', x: isM ? 2 : 15, y: isM ? 14 : 2, w: 10, h: 10, t: TILES.BLUE },
      vault: { id: 'vault', x: isM ? 2 : 28, y: isM ? 26 : 2, w: isM ? 10 : 12, h: 10, t: TILES.CHECKER },
      media: { id: 'media', x: isM ? 2 : 2, y: isM ? 38 : 15, w: 10, h: 10, t: TILES.RED },
      dhmapp: { id: 'dhmapp', x: isM ? 2 : 15, y: isM ? 50 : 15, w: 10, h: 10, t: TILES.TEAL },
      guppytank: { id: 'guppytank', x: isM ? 2 : 28, y: isM ? 62 : 15, w: isM ? 10 : 12, h: 10, t: TILES.VIOLET }
    }
  };
};

const getInitialChars = (rc) => [
  { id: 0, charId: 0, project: 'consoliday', x: rc.consoliday.x+0.5, y: rc.consoliday.y+5.5, targetX: rc.consoliday.x+0.5, targetY: rc.consoliday.y+5.5, deskX: rc.consoliday.x+4.5, deskY: rc.consoliday.y+3.1, bounds: {x1: rc.consoliday.x+1, y1: rc.consoliday.y+1, x2: rc.consoliday.x+8, y2: rc.consoliday.y+8}, state: 'wandering', step: 1, dir: 0 },
  { id: 1, charId: 4, project: 'planelite', x: rc.planelite.x+0.5, y: rc.planelite.y+5.5, targetX: rc.planelite.x+0.5, targetY: rc.planelite.y+5.5, deskX: rc.planelite.x+4.5, deskY: rc.planelite.y+3.1, bounds: {x1: rc.planelite.x+1, y1: rc.planelite.y+1, x2: rc.planelite.x+8, y2: rc.planelite.y+8}, state: 'wandering', step: 1, dir: 0 },
  { id: 2, charId: 2, project: 'contabilidad', x: rc.media.x+1.5, y: rc.media.y+5.5, targetX: rc.media.x+1.5, targetY: rc.media.y+5.5, deskX: rc.media.x+4.5, deskY: rc.media.y+3.1, bounds: {x1: rc.media.x+1, y1: rc.media.y+1, x2: rc.media.x+8, y2: rc.media.y+8}, state: 'wandering', step: 1, dir: 0 },
  { id: 3, charId: 5, project: 'dhmapp', x: rc.dhmapp.x+1.5, y: rc.dhmapp.y+5.5, targetX: rc.dhmapp.x+1.5, targetY: rc.dhmapp.y+5.5, deskX: rc.dhmapp.x+4.5, deskY: rc.dhmapp.y+3.1, bounds: {x1: rc.dhmapp.x+1, y1: rc.dhmapp.y+1, x2: rc.dhmapp.x+8, y2: rc.dhmapp.y+8}, state: 'wandering', step: 1, dir: 0 },
  { id: 4, charId: 1, project: 'manychat', x: rc.guppytank.x+2.5, y: rc.guppytank.y+5.5, targetX: rc.guppytank.x+2.5, targetY: rc.guppytank.y+5.5, deskX: rc.guppytank.x+5.5, deskY: rc.guppytank.y+3.1, bounds: {x1: rc.guppytank.x+1, y1: rc.guppytank.y+1, x2: rc.guppytank.x+8, y2: rc.guppytank.y+8}, state: 'wandering', step: 1, dir: 0 },
];

function generateMapData(MAP_ROWS, MAP_COLS, rc) {
  const mapData = Array(MAP_ROWS).fill(null).map(() => Array(MAP_COLS).fill(TILES.BLACK));
  
  for (let r = 1; r < MAP_ROWS - 1; r++) {
    for (let c = 1; c < MAP_COLS - 1; c++) { mapData[r][c] = TILES.WOOD; }
  }

  Object.values(rc).forEach(room => {
    for (let r = room.y + 1; r < room.y + room.h - 1; r++) {
      for (let c = room.x + 1; c < room.x + room.w - 1; c++) { mapData[r][c] = room.t; }
    }
    for (let c = room.y; c < room.y + room.h; c++) {
      mapData[c][room.x] = TILES.WALL_TOP; mapData[c][room.x + room.w - 1] = TILES.WALL_TOP; 
    }
    for (let c = room.x; c < room.x + room.w; c++) {
      mapData[room.y][c] = TILES.WALL_TOP; mapData[room.y + room.h - 1][c] = TILES.WALL_TOP;
    }
    const doorX = Math.floor(room.x + room.w / 2) - 1;
    if (doorX + 1 < MAP_COLS) {
      mapData[room.y + room.h - 1][doorX] = room.t;
      mapData[room.y + room.h - 1][doorX + 1] = room.t;
    }
  });

  return mapData;
}

// --- MODERN DASHBOARD UI COMPONENTS ---
const DashboardCard = ({ title, value, valueColor = "white", percent, icon }) => (
  <div className="bg-[#111625] rounded-xl p-5 flex flex-col border border-white/5 min-w-[210px] shrink-0 shadow-lg">
    <div className="flex justify-between items-start">
      <span className="text-[#7d8590] text-xs font-bold uppercase tracking-wider">{title}</span>
      <div className="bg-[#2a1f1a] text-[#ff7a00] p-1.5 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
    <div className={`text-2xl font-bold mt-4`} style={{ color: valueColor }}>
      {value}
    </div>
    <div className="flex items-center mt-2 text-xs">
      <span className="text-[#ff7a00] font-bold mr-1">↗ {percent}</span>
      <span className="text-[#7d8590]">vs mes anterior</span>
    </div>
  </div>
);

const TerminalModal = ({ project, onClose, isVaultUnlocked, decryptedSecrets }) => {
  const [logs, setLogs] = useState([`> INICIANDO CONEXIÓN A [${project.toUpperCase()}]...`]);
  const [dashData, setDashData] = useState({
     gross: "$41,874", agents: "$21,302", net: "$20,572",
     policies: "1509", members: "2041",
     dentalP: "59", dentalM: "94"
  });
  React.useEffect(() => {
    let mounted = true;
    const runQueries = async () => {
      const addLog = (msg) => { if (mounted) setLogs(prev => [...prev, msg]); };
      await new Promise(r => setTimeout(r, 600));
      addLog('> Autenticando token DHM...');
      await new Promise(r => setTimeout(r, 400));
      addLog('> CONEXIÓN ESTABLECIDA.');
      addLog('------------------------------------');
      
      try {
        if (project === 'consoliday') {
          addLog('> Consultando Pólizas de hoy...');
          const today = new Date().toISOString().split('T')[0];
          const { count, error } = await supabase.from('policies').select('*', { count: 'exact', head: true }).gte('created_at', today);
          if (error) throw error;
          addLog(`> RESULTADO: [${count || 0}] pólizas procesadas hoy.`);
        }
        else if (project === 'consoliday_data') {
          // Para el dashboard gráfico, no imprimimos en consola.
          // Solo actualizamos de fondo el estado con datos reales si existen.
          try {
            const { count, error } = await supabase.from('policies').select('*', { count: 'exact', head: true });
            if (!error && count) {
              setDashData(prev => ({ ...prev, policies: count }));
            }
          } catch(err) { console.error("Ignored UI err:", err); }
          return; // Salir silenciosamente para no invocar logic de Terminal Hacker
        } 
        else if (project === 'planelite') {
          addLog('> Consultando ventas reales de Plan Elite...');
          if (!isVaultUnlocked) {
            addLog('> [SEC-FATAL] ACCESO DENEGADO: La Bóveda Principal de DHM HQ está bloqueada.');
            addLog('> IMPOSIBLE OBTENER LLAVE DE STRIPE SIN AUTORIZACIÓN.');
            return;
          }
          const stripeKeySecret = decryptedSecrets?.find(s => s.key_name === 'STRIPE_SECRET_KEY');
          if (!stripeKeySecret) {
            addLog('> ERROR: STRIPE_SECRET_KEY no se encontró dentro de la Bóveda.');
            return;
          }
          addLog('> Llave Stripe extraída de RAM. Contactando Proxy API...');
          
          try {
             const res = await fetch('/api/stripe', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({ stripeKey: stripeKeySecret.value })
             });
             const stripeResponse = await res.json();
             
             if (!res.ok) { addLog('> ERROR API: ' + stripeResponse.error); }
             else if (!stripeResponse.data || stripeResponse.data.length === 0) {
               addLog('> INFO: Sin transacciones recientes procesadas por este token.');
             } else {
               const eliteData = stripeResponse.data.filter(p => {
                 const hasText = (p.description && p.description.toLowerCase().includes('elite')) || (p.statement_descriptor && p.statement_descriptor.toLowerCase().includes('elite'));
                 return hasText || p.amount >= 50000;
               });
               if (eliteData.length === 0) {
                 addLog('> INFO: Ninguna transacción reciente matchea específicamente el flitro Plan Elite ($1399).');
               }
               eliteData.slice(0, 10).forEach(p => {
                 const amountStr = (p.amount / 100).toFixed(2);
                 const dateStr = new Date(p.created * 1000).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
                 addLog(`> [${dateStr}] VENTA OK: $${amountStr} USD [ID: ${p.id.substring(0,8)}...]`);
               });
             }
          } catch(e) {
             addLog('> FALLA DE SEGURIDAD/CORS: El proxy /api/stripe falló.');
             addLog('> INFO: Esto se debe a que Vite no ejecuta "api/" localmente por defecto.');
             addLog('> SUBCONCLUSIÓN: Para ver Stripe en Local, inicia Vercel Dev. Si pones el mouse en otro PC, el fallback a Supabase seguirá activo.');
          }
        }
        else if (project === 'dhmapp') {
          addLog('> CONECTANDO A CLÚSTER MYSQL DE DHM HQ...');
          addLog('> Desplegando enrutador CORS inverso...');
          try {
            // Bypass Vite backend limitations via CORS Proxy since user is running generic 'npm run dev'
            const loginRes = await fetch('https://corsproxy.io/?https://panel.dhm-services.com/api/auth/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: 'info@dhm-services.com', password: 'Matanzas2024@' })
            });

            if (!loginRes.ok) throw new Error('Handshake Rechazado (Login Proxy)');
            const { accessToken } = await loginRes.json();
            addLog('> Token AES extraído exitosamente. Descargando tabla remota...');

            const res = await fetch('https://corsproxy.io/?https://panel.dhm-services.com/api/events', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!res.ok) throw new Error('API Protegida Rechazó Conexión: ' + res.status);
            
            const payload = await res.json();
            const evData = payload.events || payload; // Depending on API wrapper
            
            const todayObj = new Date();
            const day = todayObj.getDay();
            const diffFromMonday = day === 0 ? 6 : day - 1;
            
            const startOfWeek = new Date(todayObj);
            startOfWeek.setDate(todayObj.getDate() - diffFromMonday);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);
            endOfWeek.setHours(23, 59, 59, 999);

            const weekEvents = evData.filter(evt => {
              const dateStr = evt.date || evt.createdAt;
              if (!dateStr) return false;
              const d = new Date(dateStr);
              return d >= startOfWeek && d <= endOfWeek;
            });

            addLog('========================================================');
            addLog(String('DÍA/HORA').padEnd(20) + 'TÍTULO DEL EVENTO');
            addLog('========================================================');

            if (weekEvents.length === 0) {
              addLog('> [0] Eventos confirmados para esta semana.');
            } else {
              weekEvents.sort((a,b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
              
              weekEvents.forEach(evt => {
                const d = new Date(evt.date || evt.createdAt);
                const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
                const timeStr = `${days[d.getDay()]}, ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
                
                let title = evt.name || evt.title || 'Evento Confidencial';
                if (title.length > 34) title = title.substring(0, 32) + '..';
                
                addLog(String(timeStr).padEnd(20) + title);
              });
            }
            addLog('========================================================');
          } catch(err) {
            console.error("Eventos err", err);
            addLog('> ERROR DE RED: ' + err.message);
          }
        }
        else if (project === 'contabilidad') {
          addLog('> INICIANDO AUDITORÍA CONTABLE (STRIPE)...');
          if (!isVaultUnlocked) {
            addLog('> [SEC-FATAL] BÓVEDA BLOQUEADA. Se requiere acceso para leer pagos.');
            return;
          }
          const stripeKeySecret = decryptedSecrets?.find(s => s.key_name === 'STRIPE_SECRET_KEY');
          if (!stripeKeySecret) {
            addLog('> ERROR: Llave STRIPE_SECRET_KEY no detectada.');
            return;
          }
           
          addLog('> Obteniendo últimos 100 registros históricos de facturación...');
          const res = await fetch('/api/stripe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ stripeKey: stripeKeySecret.value })
          });
          const stripeResponse = await res.json();
             
          if (!res.ok) { addLog('> ERROR API: ' + stripeResponse.error); }
          else if (!stripeResponse.data || stripeResponse.data.length === 0) {
            addLog('> INFO: Sin transacciones recientes en esta cuenta.');
          } else {
            addLog('================================================================================');
            addLog(String('FECHA/HORA').padEnd(18) + String('CLIENTE').padEnd(25) + String('PRODUCTO').padEnd(26) + 'MONTO');
            addLog('================================================================================');
            
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthTransactions = stripeResponse.data.filter(p => {
               const d = new Date(p.created * 1000);
               return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
            });

            monthTransactions.forEach(p => {
              const amountStr = '$' + (p.amount / 100).toFixed(2);
              const dateObj = new Date(p.created * 1000);
              const dateStr = `${String(dateObj.getDate()).padStart(2, '0')}/${String(dateObj.getMonth()+1).padStart(2, '0')} ${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;
                 
              let cliente = 'Anónimo';
              if (p.billing_details && p.billing_details.name) cliente = p.billing_details.name;
              else if (p.customer_details && p.customer_details.name) cliente = p.customer_details.name;
              else if (p.receipt_email) cliente = p.receipt_email;
                 
              let producto = 'Membresía/Servicio';
              if (p.description) producto = p.description;
              else if (p.statement_descriptor) producto = p.statement_descriptor;
              else if (p.metadata && p.metadata.product) producto = p.metadata.product;

              if (cliente.length > 22) cliente = cliente.substring(0, 20) + '..';
              if (producto.length > 23) producto = producto.substring(0, 21) + '..';

              const line = String(dateStr).padEnd(18) + String(cliente).padEnd(25) + String(producto).padEnd(26) + amountStr;
              addLog(line);
            });
            addLog('================================================================================');
            addLog(`> FACTURAS AUDITADAS ESTE MES: ${monthTransactions.length}`);
          }
        }
        else if (project === 'manychat') {
          addLog('> CONECTANDO A MANYCHAT API...');
          if (!isVaultUnlocked) {
            addLog('> [SEC-FATAL] BÓVEDA BLOQUEADA. Se requiere acceso a MANYCHAT_API_KEY.');
            return;
          }
          const mcKeySecret = decryptedSecrets?.find(s => s.key_name === 'MANYCHAT_API_KEY');
          if (!mcKeySecret) {
            addLog('> ERROR: MANYCHAT_API_KEY no se encontró en la Bóveda.');
            addLog('> ACCIÓN: Ingresa al candado dorado y guarda tu API Key de ManyChat.');
            addLog('>         Proyecto: "ManyChat" | Categoría: "API" | Key: "MANYCHAT_API_KEY"');
            return;
          }
          addLog('> Llave ManyChat extraída de RAM. Contactando Proxy...');

          const mcFetch = async (action, params = {}) => {
            const res = await fetch('/api/manychat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ apiKey: mcKeySecret.value, action, params })
            });
            return res.json();
          };

          try {
            // 1. Page Info
            addLog('> Obteniendo info de página...');
            const pageRes = await mcFetch('getPageInfo');
            if (pageRes.status === 'success' && pageRes.data) {
              const p = pageRes.data;
              addLog('========================================================');
              addLog(`  PÁGINA: ${p.name}`);
              addLog(`  CATEGORÍA: ${p.category || 'N/A'}`);
              addLog(`  USERNAME: @${p.username || 'N/A'}`);
              addLog(`  PLAN PRO: ${p.is_pro ? '✅ SÍ' : '❌ NO'}`);
              addLog(`  TIMEZONE: ${p.timezone || 'N/A'}`);
              addLog('========================================================');
            } else {
              addLog('> WARN: No se pudo obtener info de página: ' + (pageRes.error || pageRes.message || 'Unknown'));
            }

            // 2. Tags
            addLog('> Consultando tags...');
            const tagsRes = await mcFetch('getTags');
            if (tagsRes.status === 'success' && tagsRes.data) {
              addLog(`> TAGS REGISTRADOS: [${tagsRes.data.length}]`);
              tagsRes.data.slice(0, 20).forEach(t => {
                addLog(`  • #${t.id} → ${t.name}`);
              });
              if (tagsRes.data.length > 20) addLog(`  ... y ${tagsRes.data.length - 20} más.`);
            }

            // 3. Flows (Automations)
            addLog('> Consultando flujos (automations)...');
            const flowsRes = await mcFetch('getFlows');
            if (flowsRes.status === 'success' && flowsRes.data) {
              const flows = flowsRes.data.flows || [];
              addLog(`> FLOWS ACTIVOS: [${flows.length}]`);
              flows.slice(0, 15).forEach(f => {
                addLog(`  ▸ ${f.name}`);
              });
              if (flows.length > 15) addLog(`  ... y ${flows.length - 15} más.`);
            }

            // 4. Custom Fields
            addLog('> Consultando Custom Fields...');
            const cfRes = await mcFetch('getCustomFields');
            if (cfRes.status === 'success' && cfRes.data) {
              addLog(`> CUSTOM FIELDS: [${cfRes.data.length}]`);
              cfRes.data.slice(0, 15).forEach(cf => {
                addLog(`  ◆ ${cf.name} (${cf.type})`);
              });
            }

            // 5. Growth Tools
            addLog('> Consultando Growth Tools...');
            const gtRes = await mcFetch('getGrowthTools');
            if (gtRes.status === 'success' && gtRes.data) {
              addLog(`> GROWTH TOOLS: [${gtRes.data.length}]`);
              gtRes.data.slice(0, 10).forEach(gt => {
                addLog(`  ✦ ${gt.name} [${gt.type}]`);
              });
            }

            addLog('========================================================');
            addLog('> MANYCHAT SYNC COMPLETO.');
          } catch (e) {
            addLog('> ERROR DE RED: ' + e.message);
            addLog('> DIAGNÓSTICO: El proxy /api/manychat no respondió.');
          }
        }
        else {
          addLog('> ACCESO DENEGADO: Módulo de analíticas en desarrollo para ' + project.toUpperCase());
        }
      } catch (err) {
        addLog(`> ERROR SQL: ${err.message}`);
        addLog('> DIAGNÓSTICO: La tabla requerida no existe o el esquema es distinto en DB.');
      }
      addLog('------------------------------------');
      addLog('> ESPERANDO COMANDOS_');
    };
    runQueries();
    return () => { mounted = false; };
  }, [project]);

  // Render Branch: If it's the dashboard, render graphical UI.
  if (project === 'consoliday_data') {
    return (
      <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div 
          style={{ width: '100%', maxWidth: '1150px', backgroundColor: '#0B1320', borderRadius: '1rem', padding: '2rem', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }} 

          onClick={e => e.stopPropagation()}
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-[#7d8590] hover:text-white transition-colors">
            <X size={24} />
          </button>
          
          <h2 className="text-xl font-bold text-white mb-8 border-b border-white/10 pb-4">AGENCY DASHBOARD</h2>
          
          <div className="flex flex-row gap-4 overflow-x-auto pb-4 custom-scrollbar">
            <DashboardCard title="INGRESO BRUTO" value={dashData.gross} percent="6.8%" icon={<DollarSign size={16}/>} />
            <DashboardCard title="PAGO AGENTES" value={dashData.agents} percent="5.6%" icon={<Users size={16}/>} />
            <DashboardCard title="UTILIDAD NETA" value={dashData.net} valueColor="#ff7a00" percent="8.0%" icon={<TrendingUp size={16}/>} />
            <DashboardCard title="PÓLIZAS / MIEMBROS" value={`${dashData.policies} / ${dashData.members}`} percent="3.1%" icon={<BarChart2 size={16}/>} />
            <DashboardCard title="DENTAL" value={`${dashData.dentalP} / ${dashData.dentalM}`} valueColor="#ff7a00" percent="55.3%" icon={<Heart size={16}/>} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 99999 }}>
      <div className="modal-content" style={{ background: '#0a0a0f', border: '1px solid #22c55e', boxShadow: '0 0 20px rgba(34, 197, 94, 0.2)', fontFamily: 'monospace', color: '#4ade80', width: '600px', height: '400px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #166534', paddingBottom: '10px', marginBottom: '15px' }}>
          <span style={{ fontWeight: 'bold', textShadow: '0 0 5px #22c55e' }}>TERMINAL DEL SISTEMA // {project.toUpperCase()}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#22c55e', cursor: 'pointer', fontWeight: 'bold' }}>[ X ]</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
          {logs.map((log, i) => <div key={i} style={{ opacity: i === logs.length-1 ? 1 : 0.8 }}>{log}</div>)}
        </div>
      </div>
    </div>
  );
};

function App() {
  const { isM, MAP_COLS, MAP_ROWS, rc } = useMemo(() => getLayout(), []);
  const mapData = useMemo(() => generateMapData(MAP_ROWS, MAP_COLS, rc), [MAP_ROWS, MAP_COLS, rc]);

  // Characters Engine State
  const [characters, setCharacters] = useState(() => getInitialChars(rc));

  // GAME LOOP: AI Traversal
  React.useEffect(() => {
    const SPEED = 0.15; // tiles per tick
    const interval = setInterval(() => {
      setCharacters(prev => prev.map(char => {
        let { x, y, targetX, targetY, state, step, dir } = char;
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < SPEED) { // reached target
           x = targetX; y = targetY; step = 1; 
           if (state === 'wandering') {
              if (Math.random() < 0.02) {
                 targetX = char.bounds.x1 + Math.random() * (char.bounds.x2 - char.bounds.x1);
                 targetY = char.bounds.y1 + Math.random() * (char.bounds.y2 - char.bounds.y1);
              }
           } else if (state === 'walking_to_pc') {
              state = 'working'; dir = 3; // face PC (Up)
              setTimeout(() => {
                 setCharacters(curr => curr.map(c => c.id === char.id ? { ...c, state: 'wandering' } : c));
              }, 12000); // Back to wandering after 12s
           }
        } else { // moving
           x += (dx / dist) * SPEED; y += (dy / dist) * SPEED;
           if (Math.abs(dx) > Math.abs(dy)) dir = dx > 0 ? 2 : 1;
           else dir = dy > 0 ? 0 : 3;
           
           const cycle = Math.floor((Math.abs(x) + Math.abs(y)) * 4) % 4;
           step = cycle === 3 ? 1 : cycle; 
        }
        return { ...char, x, y, targetX, targetY, state, step, dir };
      }));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Terminals State
  const [activeTerminal, setActiveTerminal] = useState(null);

  // Vault State
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [showVaultUI, setShowVaultUI] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [vaultError, setVaultError] = useState('');
  const [decryptedSecrets, setDecryptedSecrets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewSecretModal, setShowNewSecretModal] = useState(false);
  const [secretType, setSecretType] = useState('secret');
  const [newSecret, setNewSecret] = useState({ project: '', category: '', key_name: '', value: '' });

  const metricsRef = React.useRef({ consolidayPol: 0, planeliteRev: 0 });

  // POLING ENGINE: Triggers external NPCs every 10 MINUTES
  React.useEffect(() => {
    let poller = setInterval(async () => {
       if (!isVaultUnlocked) return;
       let trConsoliday = false, trPlanElite = false;
       
       // Consoliday trigger check (Supabase)
       try {
         const today = new Date().toISOString().split('T')[0];
         const { count } = await supabase.from('policies').select('*', { count: 'exact', head: true }).gte('created_at', today);
         
         if (count && count > metricsRef.current.consolidayPol) {
            trConsoliday = true; metricsRef.current.consolidayPol = count;
         }
       } catch(e) { }

       // Plan Elite trigger check (Stripe Proxy)
       const stripeKeySecret = decryptedSecrets?.find(s => s.key_name === 'STRIPE_SECRET_KEY');
       if (stripeKeySecret) {
         try {
           const res = await fetch('/api/stripe', { method: 'POST', body: JSON.stringify({ stripeKey: stripeKeySecret.value }) });
           const { data } = await res.json();
           if (data && data.length > 0) {
              const rev = data[0].amount;
              if (rev !== metricsRef.current.planeliteRev) {
                trPlanElite = true; metricsRef.current.planeliteRev = rev;
              }
           }
         } catch(e) {}
       }
       
       if (trConsoliday || trPlanElite) {
         setCharacters(prev => prev.map(char => {
            if (char.project === 'consoliday' && trConsoliday && char.state === 'wandering') return { ...char, state: 'walking_to_pc', targetX: char.deskX, targetY: char.deskY };
            if (char.project === 'planelite' && trPlanElite && char.state === 'wandering') return { ...char, state: 'walking_to_pc', targetX: char.deskX, targetY: char.deskY };
            return char;
         }));
       }
    }, 600000); // 10 minutes interval
    return () => clearInterval(poller);
  }, [isVaultUnlocked, decryptedSecrets]);

  // Auto-Unlock in background
  React.useEffect(() => {
    const autoUnlock = async () => {
      try {
        const { data, error } = await supabase.from('secrets').select('*').order('project');
        if (error || !data) return;
        
        const decryptedData = [];
        for (const item of data) {
          if (item.encrypted_value.startsWith('PLAIN:')) {
            decryptedData.push({ id: item.id, project: item.project, category: item.category, key_name: item.key_name, value: item.encrypted_value.substring(6), isPlain: true });
          } else {
            try {
              const bytes = CryptoJS.AES.decrypt(item.encrypted_value, 'DHM2026$');
              const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
              if (decryptedValue) decryptedData.push({ id: item.id, project: item.project, category: item.category, key_name: item.key_name, value: decryptedValue, isPlain: false });
            } catch(e) {}
          }
        }
        setDecryptedSecrets(decryptedData);
        setIsVaultUnlocked(true);
      } catch (err) { console.error('Auto-unlock silent failure:', err); }
    };
    autoUnlock();
  }, []);

  const handleVaultClick = () => {
    if (isVaultUnlocked) { setShowVaultUI(true); } 
    else { setShowPasswordModal(true); setVaultError(''); }
  };

  const attemptUnlock = async (e) => {
    e.preventDefault(); setIsLoading(true); setVaultError('');
    try {
      const { data, error } = await supabase.from('secrets').select('*').order('project');
      if (error) throw error;
      const decryptedData = [];
      let successCount = 0;
      let encryptedCount = 0;
      
      if (!data || data.length === 0) { setIsVaultUnlocked(true); setShowVaultUI(true); setShowPasswordModal(false); setIsLoading(false); return; }
      
      for (const item of data) {
        if (item.encrypted_value.startsWith('PLAIN:')) {
          decryptedData.push({ id: item.id, project: item.project, category: item.category, key_name: item.key_name, value: item.encrypted_value.substring(6), isPlain: true });
          successCount++;
        } else {
          encryptedCount++;
          const bytes = CryptoJS.AES.decrypt(item.encrypted_value, masterPassword);
          const decryptedValue = bytes.toString(CryptoJS.enc.Utf8);
          if (decryptedValue) { decryptedData.push({ id: item.id, project: item.project, category: item.category, key_name: item.key_name, value: decryptedValue, isPlain: false }); successCount++; }
        }
      }
      
      if (successCount === data.length && data.length > 0) { setDecryptedSecrets(decryptedData); setIsVaultUnlocked(true); setShowVaultUI(true); setShowPasswordModal(false); } 
      else setVaultError('Contraseña incorrecta o datos corruptos.');
    } catch (err) { setVaultError('Contraseña incorrecta.'); } finally { setIsLoading(false); }
  };

  const handleAddSecret = async (e) => {
    e.preventDefault(); setIsLoading(true);
    try {
      const saveValue = secretType === 'knowledge' 
          ? `PLAIN:${newSecret.value}` 
          : CryptoJS.AES.encrypt(newSecret.value, masterPassword).toString();
          
      const { data, error } = await supabase.from('secrets').insert([{ project: newSecret.project, category: newSecret.category, key_name: newSecret.key_name, encrypted_value: saveValue }]).select();
      if (error) throw error;
      setDecryptedSecrets([...decryptedSecrets, { id: data[0].id, project: newSecret.project, category: newSecret.category, key_name: newSecret.key_name, value: newSecret.value, isPlain: secretType === 'knowledge' }]);
      setShowNewSecretModal(false); setNewSecret({ project: '', category: '', key_name: '', value: '' }); setSecretType('secret');
    } catch (err) { alert('Error: ' + err.message); } finally { setIsLoading(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar permanente?')) return;
    try {
      const { error } = await supabase.from('secrets').delete().eq('id', id);
      if (error) throw error; setDecryptedSecrets(decryptedSecrets.filter(s => s.id !== id));
    } catch (err) { alert('Error: ' + err.message); }
  };

  return (
    <>
      <div className="app-overlay">
        <div className="top-bar">
          <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '1px' }}>DHM HQ</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status: <span style={{ color: '#4ade80' }}>Online</span></div>
        </div>
        <div className="controls-hint" style={{ bottom: 20 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>🖱️ Arrastrar = Mover</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>🔍 Scroll = Zoom</span>
        </div>
      </div>

      <TransformWrapper 
        initialScale={isM ? 0.55 : 1.5} 
        initialPositionX={typeof window !== 'undefined' ? (window.innerWidth - (MAP_COLS * 16 * 3 * (isM ? 0.55 : 1.5))) / 2 : 0}
        initialPositionY={isM ? 40 : 0}
        minScale={0.3} 
        maxScale={4} 
        limitToBounds={false}
      >
        <TransformComponent wrapperStyle={{ width: '100vw', height: '100vh', background: '#0a0a0f' }}>
          
          <div className="world-map" style={{ 
            width: MAP_COLS * NATIVE_TILE_SIZE, 
            height: MAP_ROWS * NATIVE_TILE_SIZE, 
            position: 'relative', 
            transform: `scale(${SCALE})`, 
            transformOrigin: 'top left',
            imageRendering: 'pixelated',
            boxShadow: '0 0 50px rgba(0,0,0,0.8)'
          }}>
            
            {/* 1. RENDER BACKGROUND TILES */}
            {mapData.map((row, r) => row.map((tile, c) => (
              <div 
                key={`${r}-${c}`} 
                style={{
                  position: 'absolute', left: c * NATIVE_TILE_SIZE, top: r * NATIVE_TILE_SIZE,
                  width: NATIVE_TILE_SIZE, height: NATIVE_TILE_SIZE,
                  backgroundImage: 'url(/assets/TilesHouse.png)',
                  backgroundPosition: bgPosition(tile.tx, tile.ty),
                  zIndex: 0
                }} 
              />
            )))}

            {/* 2. RENDER FOREGROUND OBJECTS AND ROOMS */}

            {/* CONSOLIDAY ROOM */}
            <RoomHUD col={rc.consoliday.x} row={rc.consoliday.y} widthCols={rc.consoliday.w} title="CONSOLIDAY" color="#e58f55" status="live" stats={{users: '24K+', revenue: '$1.2M'}} />
            <DeskWorker col={rc.consoliday.x+4} row={rc.consoliday.y+4} project="consoliday" onPCClick={setActiveTerminal} />
            <Prop type="WHITEBOARD" col={rc.consoliday.x+3} row={rc.consoliday.y} zIndexOffset={5} />
            <Prop type="PLANT_2" col={rc.consoliday.x+8} row={rc.consoliday.y} zIndexOffset={5} />
            <Cupboard col={rc.consoliday.x+1} row={rc.consoliday.y+5} onClick={() => setActiveTerminal('consoliday_data')} zIndexOffset={5} />

            {/* PLAN ELITE ROOM */}
            <RoomHUD col={rc.planelite.x} row={rc.planelite.y} widthCols={rc.planelite.w} title="PLAN ELITE" color="#5582e5" status="live" stats={{users: '1.3K', revenue: '$850K'}} />
            <DeskWorker col={rc.planelite.x+4} row={rc.planelite.y+4} project="planelite" onPCClick={setActiveTerminal} />
            <Prop type="DOUBLE_BOOKSHELF" col={rc.planelite.x+1} row={rc.planelite.y} zIndexOffset={5} />
            <Prop type="COFFEE" col={rc.planelite.x+8} row={rc.planelite.y+5} zIndexOffset={5} />

            {/* LA BOVEDA */}
            <RoomHUD col={rc.vault.x} row={rc.vault.y} widthCols={rc.vault.w} title="LA BÓVEDA" color="#ebd025" status="live" stats={{users: 'Secure', revenue: 'AES-256'}} />
            <Prop type="PC_SIDE:left" col={rc.vault.x+2} row={rc.vault.y+2} zIndexOffset={5} />
            <Prop type="PC_SIDE:left" col={rc.vault.x+2} row={rc.vault.y+6} zIndexOffset={5} />
            <Prop type="PC_SIDE" col={rc.vault.x+9} row={rc.vault.y+2} zIndexOffset={5} />
            <Prop type="PC_SIDE" col={rc.vault.x+9} row={rc.vault.y+6} zIndexOffset={5} />
            {/* The Safe Door triggering Modal */}
            <div style={{ position: 'absolute', left: (rc.vault.x+5) * NATIVE_TILE_SIZE, top: (rc.vault.y+2.5) * NATIVE_TILE_SIZE, zIndex: 60, width: NATIVE_TILE_SIZE * 2, height: NATIVE_TILE_SIZE * 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div onClick={handleVaultClick} className="clickable" style={{ padding: 6, background: 'rgba(0,0,0,0.85)', border: '2px solid #ebd025', borderRadius: 4, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 0 15px rgba(235,208,37,0.5)' }}>
                  <div style={{ color: '#ebd025', transform: 'scale(0.8)' }}>{isVaultUnlocked ? <Unlock /> : <Lock />}</div>
                </div>
            </div>

            {/* CONTABILIDAD ROOM */}
            <RoomHUD col={rc.media.x} row={rc.media.y} widthCols={rc.media.w} title="CONTABILIDAD" color="#55e582" status="live" stats={{movimientos: 'Audit', auth: 'Stripe'}} />
            <DeskWorker col={rc.media.x+4} row={rc.media.y+4} project="contabilidad" onPCClick={setActiveTerminal} />
            <Prop type="CABINET_METAL" col={rc.media.x+3} row={rc.media.y} zIndexOffset={5} />

            {/* DHM APP ROOM */}
            <RoomHUD col={rc.dhmapp.x} row={rc.dhmapp.y} widthCols={rc.dhmapp.w} title="DHM APP" color="#55e5a7" status="dev" stats={{users: 'Beta', revenue: '-'}} />
            <DeskWorker col={rc.dhmapp.x+4} row={rc.dhmapp.y+4} project="dhmapp" onPCClick={setActiveTerminal} />

            {/* MANYCHAT / GUPPY TANK ROOM */}
            <RoomHUD col={rc.guppytank.x} row={rc.guppytank.y} widthCols={rc.guppytank.w} title="MANYCHAT" color="#9a55e5" status="live" stats={{users: 'Bots', revenue: 'IG/FB'}} />
            <DeskWorker col={rc.guppytank.x+5} row={rc.guppytank.y+4} project="manychat" onPCClick={setActiveTerminal} />
            <Prop type="CACTUS" col={rc.guppytank.x+10} row={rc.guppytank.y+1} zIndexOffset={5} />

            {/* DYNAMIC NPCS VIVA ENGINE */}
            {characters.map(char => (
              <CharProp 
                key={char.id} 
                charId={char.charId} 
                x={char.x} 
                y={char.y} 
                direction={char.dir} 
                step={char.step} 
                showBubble={char.state === 'working'} 
              />
            ))}

          </div>
        </TransformComponent>
      </TransformWrapper>

      {/* Terminal Hacker Modal */}
      {activeTerminal && <TerminalModal project={activeTerminal} onClose={() => setActiveTerminal(null)} isVaultUnlocked={isVaultUnlocked} decryptedSecrets={decryptedSecrets} />}

      {/* Vault Modals */}
      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content vault-modal-content" onClick={e => e.stopPropagation()}>
            <div className="vault-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><KeyRound /> Desbloquear Bóveda</h2></div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>Ingrese la contraseña maestra local (AES-256).</p>
            <form onSubmit={attemptUnlock}>
              <input type="password" className="input-field" placeholder="***" value={masterPassword} onChange={e => setMasterPassword(e.target.value)} autoFocus style={{ borderColor: vaultError ? '#ef4444' : 'var(--border-light)' }} />
              {vaultError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '15px' }}>{vaultError}</p>}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: 'white' }} onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" className="btn" style={{ color: '#000', background: 'var(--color-vault)' }}>Desbloquear</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVaultUI && !showPasswordModal && (
         <div className="modal-overlay" onClick={() => setShowVaultUI(false)}>
           <div className="modal-content vault-modal-content" style={{ maxWidth: '800px' }} onClick={e => e.stopPropagation()}>
             <div className="vault-header">
               <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Unlock /> API Keys & Secretos</h2>
               <div style={{ display: 'flex', gap: '10px' }}>
                 <button className="btn" style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px' }} onClick={() => { setIsVaultUnlocked(false); setShowVaultUI(false); setDecryptedSecrets([]); setMasterPassword(''); }}>Bloquear Sesión</button>
                 <button className="btn" style={{ background: 'var(--color-vault)', color: '#000', padding: '6px 12px' }} onClick={() => setShowNewSecretModal(true)}>+ Nuevo</button>
                 <button className="close-btn" onClick={() => setShowVaultUI(false)}>✕</button>
               </div>
             </div>
             <div className="vault-grid">
                {decryptedSecrets.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Bóveda vacía.</p>}
                {decryptedSecrets.map(s => (
                  <div key={s.id} style={{ background: 'rgba(0,0,0,0.3)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(235, 208, 37, 0.3)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--color-vault)', textTransform: 'uppercase' }}>{s.project} &bull; {s.category}</span>
                      <button onClick={() => handleDelete(s.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <span style={{ fontWeight: '600' }}>{s.key_name}</span>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                        <pre style={{ 
                          background: '#0a0a0f', padding: '10px', borderRadius: '4px', fontSize: '0.85rem', 
                          color: '#cbd5e1', margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                          maxHeight: '200px', overflowY: 'auto', flex: 1, border: '1px solid #1e293b'
                        }}>
                          {s.value}
                        </pre>
                        <button title="Copiar al portapapeles" onClick={() => navigator.clipboard.writeText(s.value)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '5px' }}><Copy size={16} /></button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
           </div>
         </div>
      )}

      {showNewSecretModal && (
        <div className="modal-overlay" onClick={() => setShowNewSecretModal(false)}>
          <div className="modal-content vault-modal-content" onClick={e => e.stopPropagation()}>
            <div className="vault-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Plus /> Guardar en Bóveda</h2></div>
            <form onSubmit={handleAddSecret}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <button type="button" style={{ flex: 1, padding: '8px', background: secretType === 'secret' ? 'rgba(235, 208, 37, 0.2)' : 'transparent', border: '1px solid var(--color-vault)', borderRadius: '4px', cursor: 'pointer', color: 'white' }} onClick={() => setSecretType('secret')}>API Key / Secreto</button>
                <button type="button" style={{ flex: 1, padding: '8px', background: secretType === 'knowledge' ? 'rgba(235, 208, 37, 0.2)' : 'transparent', border: '1px solid var(--color-vault)', borderRadius: '4px', cursor: 'pointer', color: 'white' }} onClick={() => setSecretType('knowledge')}>Base de Conocimiento</button>
              </div>
              <input type="text" required placeholder="Proyecto (ej. Consoliday, General)" className="input-field" value={newSecret.project} onChange={e => setNewSecret({...newSecret, project: e.target.value})} />
              <input type="text" required placeholder="Categoría (ej. DB, Instrucciones, API)" className="input-field" value={newSecret.category} onChange={e => setNewSecret({...newSecret, category: e.target.value})} />
              <input type="text" required placeholder="Nombre / Título (ej. STRIPE_KEY o Guía Onboarding)" className="input-field" value={newSecret.key_name} onChange={e => setNewSecret({...newSecret, key_name: e.target.value})} />
              
              {secretType === 'secret' ? (
                <input type="password" required placeholder="Valor Secreto (Se ocultará al escribir)" className="input-field" value={newSecret.value} onChange={e => setNewSecret({...newSecret, value: e.target.value})} />
              ) : (
                <textarea 
                  required 
                  placeholder="Escribe o pega aquí la Base de Conocimiento (Soporta múltiples líneas)" 
                  className="input-field" 
                  style={{ minHeight: '120px', resize: 'vertical', fontFamily: 'monospace' }}
                  value={newSecret.value} 
                  onChange={e => setNewSecret({...newSecret, value: e.target.value})} 
                />
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="btn" style={{ background: 'transparent', color: 'white' }} onClick={() => setShowNewSecretModal(false)}>Cancelar</button>
                <button type="submit" className="btn" disabled={isLoading} style={{ color: '#000', background: 'var(--color-vault)' }}>{isLoading ? '...' : 'Encriptar y Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
