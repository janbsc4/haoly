import type { ReactElement } from "react";

// Drawings of what a card's word means, keyed by stable card ID, on an 80×80 grid.
// Only words with an unambiguous picture get one: pronouns, grammar, numbers, dates,
// family relations and full sentences stay text-only rather than risk a misleading image.
// Loaded lazily by CardPicture so the drawings never weigh on the eager study bundle.

function Sun({ cx, cy }: { cx: number; cy: number }) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
    const radians = (angle * Math.PI) / 180;
    const x = Math.cos(radians);
    const y = Math.sin(radians);
    return `M${cx + 10 * x} ${cy + 10 * y}L${cx + 14 * x} ${cy + 14 * y}`;
  });
  return (
    <>
      <path className="pic-accent" d={rays.join("")} />
      <circle className="pic-gold" cx={cx} cy={cy} r="7" />
    </>
  );
}

// The sun's place on its daily arc tells the parts of the day apart.
function SkyArc({ cx, cy }: { cx: number; cy: number }) {
  return (
    <>
      <path className="pic-thin pic-dash" d="M14 58a26 26 0 0 1 52 0" />
      <Sun cx={cx} cy={cy} />
      <path className="pic-bg pic-flat" d="M4 58h72v18H4z" />
      <path d="M8 58h64" />
    </>
  );
}

const flagOutline = <rect x="10" y="20" width="60" height="40" rx="2" />;

function Bowl({ className }: { className: string }) {
  return (
    <>
      <path className={className} d="M12 42h56c0 16-12 26-28 26S12 58 12 42z" />
      <path d="M32 68v4h16v-4" />
    </>
  );
}

function Storefront({ children }: { children: ReactElement }) {
  return (
    <>
      <path className="pic-paper" d="M14 34h52v38H14z" />
      <path className="pic-red" d="M10 20h60l4 14H6z" />
      <path className="pic-thin" d="M8 72h64" />
      {children}
    </>
  );
}

const glassOutline = "M22 16h36l-5 54a4 4 0 0 1-4 4H31a4 4 0 0 1-4-4z";

const wavingHand = (
  <>
    <g transform="rotate(-12 40 44)">
      <path
        className="pic-soft"
        d="M28 72c-6-6-12-16-14-22a4 4 0 0 1 7-4l6 8V24a4 4 0 0 1 8 0v18V18a4 4 0 0 1 8 0v24V22a4 4 0 0 1 8 0v22V30a4 4 0 0 1 8 0v24c0 10-6 18-14 18z"
      />
    </g>
    <path className="pic-accent" d="M64 16c4 2 6 6 6 10M68 8c6 3 9 9 9 15" />
  </>
);

const thumb = (
  <>
    <path
      className="pic-soft"
      d="M30 70h24a6 6 0 0 0 6-6l4-20a6 6 0 0 0-6-7H44l2-12a6 6 0 0 0-11-3L26 38v32z"
    />
    <path className="pic-paper" d="M14 38h12v34H14z" />
    <path className="pic-thin" d="M62 50H50M60 59H50" />
  </>
);

export const cardPictures: Record<string, ReactElement> = {
  // 牛奶: a milk carton.
  FC016: (
    <>
      <path className="pic-paper" d="M24 32l6-14h20l6 14v42H24z" />
      <path d="M24 32h32M30 18v-6h20v6" />
      <path className="pic-blue-soft" d="M40 42c5 7 8 11 8 15a8 8 0 0 1-16 0c0-4 3-8 8-15z" />
    </>
  ),
  // 人／亻: a person.
  FC021: (
    <>
      <circle className="pic-soft" cx="40" cy="18" r="8" />
      <path d="M40 28v24M26 38h28M40 52l-10 20M40 52l10 20" />
    </>
  ),
  // 口: a mouth.
  FC024: (
    <>
      <path className="pic-red" d="M12 40C20 30 30 26 36 30c2 1 6 1 8 0 6-4 16 0 24 10C56 56 24 56 12 40z" />
      <path d="M12 40c16 4 40 4 56 0" />
    </>
  ),
  // 好: thumbs up.
  FC028: thumb,
  // 不好: thumbs down.
  FC037: <g transform="rotate(180 40 44)">{thumb}</g>,
  // 家: a house.
  FC046: (
    <>
      <path className="pic-soft" d="M20 36L40 18l20 18v36H20z" />
      <path d="M12 42L40 16l28 26M34 72V54h12v18" />
    </>
  ),
  // 中国: the flag of China.
  FC066: (
    <>
      <rect className="pic-red pic-flat" x="10" y="20" width="60" height="40" rx="2" />
      <path
        className="pic-gold pic-flat"
        d="M21 25l1.3 4.1h4.4l-3.5 2.6 1.3 4.2-3.5-2.6-3.5 2.6 1.3-4.2-3.5-2.6h4.4zM31 21.8l.5 1.5h1.6l-1.3 1 .5 1.5-1.3-1-1.3 1 .5-1.5-1.3-1h1.6zM35 26.8l.5 1.5h1.6l-1.3 1 .5 1.5-1.3-1-1.3 1 .5-1.5-1.3-1h1.6zM35 32.8l.5 1.5h1.6l-1.3 1 .5 1.5-1.3-1-1.3 1 .5-1.5-1.3-1h1.6zM31 36.8l.5 1.5h1.6l-1.3 1 .5 1.5-1.3-1-1.3 1 .5-1.5-1.3-1h1.6z"
      />
      {flagOutline}
    </>
  ),
  // 日本: the flag of Japan.
  FC067: (
    <>
      <rect className="pic-paper pic-flat" x="10" y="20" width="60" height="40" rx="2" />
      <circle className="pic-red pic-flat" cx="40" cy="40" r="11" />
      {flagOutline}
    </>
  ),
  // 韩国: the flag of South Korea.
  FC068: (
    <>
      <rect className="pic-paper pic-flat" x="10" y="20" width="60" height="40" rx="2" />
      <circle className="pic-blue pic-flat" cx="40" cy="40" r="10" />
      <path className="pic-red pic-flat" d="M30 40a10 10 0 0 1 20 0a5 5 0 0 1-10 0a5 5 0 0 0-10 0z" />
      <path
        className="pic-thick"
        d="M15 31l5-6M18 33l5-6M21 35l5-6M65 31l-5-6M62 33l-5-6M59 35l-5-6M15 49l5 6M18 47l5 6M21 45l5 6M65 49l-5 6M62 47l-5 6M59 45l-5 6"
      />
      {flagOutline}
    </>
  ),
  // 名字: a name tag.
  FC071: (
    <>
      <rect className="pic-paper" x="12" y="22" width="56" height="38" rx="4" />
      <path className="pic-red" d="M12 34v-8a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v8z" />
      <path className="pic-accent" d="M22 48c4-6 6 4 10-2s6 4 10-2 6 4 10-2 4 2 6 2" />
    </>
  ),
  // 上: a ball above a line.
  FC103: (
    <>
      <path d="M12 56h48" />
      <circle className="pic-red" cx="36" cy="38" r="8" />
      <path className="pic-accent" d="M66 56V22M60 28l6-6 6 6" />
    </>
  ),
  // 下: a ball below a line.
  FC104: (
    <>
      <path d="M12 24h48" />
      <circle className="pic-red" cx="36" cy="42" r="8" />
      <path className="pic-accent" d="M66 24v34M60 52l6 6 6-6" />
    </>
  ),
  // 早上: the sun rising.
  FC106: <SkyArc cx={14.9} cy={51.3} />,
  // 上午: the sun climbing.
  FC107: <SkyArc cx={23.3} cy={38.1} />,
  // 中午: the sun at its highest.
  FC108: <SkyArc cx={40} cy={32} />,
  // 下午: the sun going down.
  FC109: <SkyArc cx={58.4} cy={39.6} />,
  // 晚上: the moon and stars.
  FC110: (
    <>
      <path className="pic-soft" d="M44 14a22 22 0 1 0 22 30A18 18 0 1 1 44 14z" />
      <path className="pic-thick pic-accent" d="M62 16v6M59 19h6M18 18v4M16 20h4M66 60v4M64 62h4" />
    </>
  ),
  // 再见！: a waving hand.
  FC118: wavingHand,
  // 拜拜！: a waving hand.
  FC119: wavingHand,
  // 茶: a steaming cup of tea.
  FC125: (
    <>
      <path className="pic-thin" d="M32 32c-4-5 4-8 0-14M44 32c-4-5 4-8 0-14" />
      <path className="pic-jade-soft" d="M16 38h48c0 16-10 28-24 28S16 54 16 38z" />
      <path d="M12 72h56" />
    </>
  ),
  // 珍珠: a pearl in an open shell.
  FC126: (
    <>
      <path className="pic-soft" d="M14 46C18 22 62 22 66 46z" />
      <path className="pic-soft" d="M10 50c6 16 54 16 60 0z" />
      <circle className="pic-paper" cx="40" cy="46" r="9" />
      <path className="pic-thin" d="M35 43a5 5 0 0 1 4-4" />
    </>
  ),
  // 珍珠奶茶: a cup of bubble tea with a straw and tapioca pearls.
  FC127: (
    <>
      <path className="pic-soft" d="M20 30h40l-5 42a4 4 0 0 1-4 3.5H29a4 4 0 0 1-4-3.5z" />
      <path d="M17 30h46" />
      <path className="pic-accent" d="M44 30l8-24h7" />
      <g className="pic-ink">
        <circle cx="31" cy="67" r="3.2" />
        <circle cx="40" cy="69" r="3.2" />
        <circle cx="49" cy="66" r="3.2" />
        <circle cx="35" cy="60" r="3.2" />
        <circle cx="45" cy="59" r="3.2" />
      </g>
    </>
  ),
  // 什么时候: a clock.
  FC136: (
    <>
      <circle className="pic-paper" cx="40" cy="40" r="28" />
      <path className="pic-thin" d="M40 15v4M65 40h-4M40 65v-4M15 40h4" />
      <path className="pic-accent" d="M40 24v16l12 8" />
    </>
  ),
  // 跑步: a person running.
  FC137: (
    <>
      <circle className="pic-soft" cx="50" cy="16" r="7" />
      <path d="M46 25l-7 21M45 30l10 7 6-6M44 30l-11 3-5 8M39 46l12 10-2 14M39 46l-10 12-12-3" />
      <path className="pic-thin" d="M6 30h10M4 40h12M8 50h10" />
    </>
  ),
  // 洗澡: a running shower.
  FC138: (
    <>
      <path d="M14 8h22a6 6 0 0 1 6 6v8" />
      <path className="pic-paper" d="M34 22h16l8 10H26z" />
      <path className="pic-water" d="M30 40l-2 6M38 40l-1 6M46 40l1 6M54 40l2 6M28 54l-2 6M36 54l-1 6M48 54l1 6M56 54l2 6M30 68l-1 4M42 66v6M52 68l1 4" />
    </>
  ),
  // 咖啡厅: a steaming coffee mug.
  FC161: (
    <>
      <path className="pic-thin" d="M30 24c-3-4 3-6 0-12M42 24c-3-4 3-6 0-12" />
      <path d="M54 38h4a8 8 0 0 1 0 16h-4" />
      <path className="pic-amber" d="M18 30h36v30a10 10 0 0 1-10 10H28a10 10 0 0 1-10-10z" />
      <path d="M12 74h48" />
    </>
  ),
  // 海滩: a beach umbrella by the waves.
  FC162: (
    <>
      <circle className="pic-gold" cx="64" cy="16" r="6" />
      <path d="M36 40l5 26" />
      <path className="pic-red" d="M14 40a22 16 0 0 1 44 0z" />
      <path className="pic-soft pic-flat" d="M4 66h72v10H4z" />
      <path className="pic-water" d="M6 64c6-4 10-4 16 0s10 4 16 0 10-4 16 0 10 4 16 0" />
    </>
  ),
  // 餐厅: a plate between a fork and a knife.
  FC163: (
    <>
      <circle className="pic-paper" cx="40" cy="44" r="17" />
      <circle className="pic-thin" cx="40" cy="44" r="11" />
      <path d="M12 16v14a4 4 0 0 0 8 0V16M16 16v56M68 70V16c-6 4-7 18-1 24h1" />
    </>
  ),
  // 睡觉: someone asleep in bed.
  FC168: (
    <>
      <path d="M8 34v38M72 52v20M8 62h64" />
      <path className="pic-paper" d="M8 52h64v10H8z" />
      <circle className="pic-soft" cx="20" cy="44" r="7" />
      <path className="pic-blue-soft" d="M28 52v-6a8 8 0 0 1 8-8h30a6 6 0 0 1 6 6v8z" />
      <path className="pic-thin" d="M46 14h8l-8 8h8M60 6h6l-6 6h6" />
    </>
  ),
  // 工作: a briefcase.
  FC169: (
    <>
      <path d="M32 28v-6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6" />
      <rect className="pic-amber" x="12" y="28" width="56" height="40" rx="4" />
      <path d="M12 46h56" />
      <rect className="pic-gold" x="36" y="42" width="8" height="8" rx="1" />
    </>
  ),
  // 西班牙: the flag of Spain.
  FC170: (
    <>
      <rect className="pic-red pic-flat" x="10" y="20" width="60" height="40" rx="2" />
      <path className="pic-gold pic-flat" d="M10 30h60v20H10z" />
      {flagOutline}
    </>
  ),
  // 法国: the flag of France.
  FC171: (
    <>
      <rect className="pic-paper pic-flat" x="10" y="20" width="60" height="40" rx="2" />
      <path className="pic-blue pic-flat" d="M12 20h18v40H12a2 2 0 0 1-2-2V22a2 2 0 0 1 2-2z" />
      <path className="pic-red pic-flat" d="M50 20h18a2 2 0 0 1 2 2v36a2 2 0 0 1-2 2H50z" />
      {flagOutline}
    </>
  ),
  // 奶茶店: a shop with bubble tea in the window.
  FC174: (
    <Storefront>
      <>
        <path d="M20 72V50h12v22" />
        <rect className="pic-blue-soft" x="40" y="42" width="20" height="24" />
        <path className="pic-soft" d="M44 50h12l-2 13h-8z" />
        <path className="pic-accent" d="M51 50l3-6" />
      </>
    </Storefront>
  ),
  // 商店: a shop with an awning.
  FC175: (
    <Storefront>
      <>
        <path d="M34 72V52h12v20" />
        <rect className="pic-blue-soft" x="20" y="44" width="10" height="10" />
        <rect className="pic-blue-soft" x="50" y="44" width="10" height="10" />
      </>
    </Storefront>
  ),
  // 哪里／哪儿: a map pin.
  FC177: (
    <>
      <path className="pic-thin" d="M28 72h24" />
      <path className="pic-red" d="M40 72s20-22 20-38a20 20 0 0 0-40 0c0 16 20 38 20 38z" />
      <circle className="pic-paper" cx="40" cy="34" r="7" />
    </>
  ),
  // 水: a glass of water.
  FC186: (
    <>
      <path className="pic-blue-soft pic-flat" d="M24 34h32l-3 36a4 4 0 0 1-4 4H31a4 4 0 0 1-4-4z" />
      <path d={glassOutline} />
      <path className="pic-water" d="M24 34h32" />
    </>
  ),
  // 橙汁: a glass of orange juice.
  FC187: (
    <>
      <path className="pic-accent" d="M44 30l6-24h6" />
      <path className="pic-orange pic-flat" d="M24 30h32l-3 40a4 4 0 0 1-4 4H31a4 4 0 0 1-4-4z" />
      <path d={glassOutline} />
      <circle className="pic-gold" cx="22" cy="18" r="9" />
      <path className="pic-thin" d="M22 18v-7M22 18l6 4M22 18l-6 4" />
    </>
  ),
  // 啤酒: a mug of beer.
  FC188: (
    <>
      <path d="M50 34h6a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6h-6" />
      <path className="pic-gold" d="M18 26h32v42a4 4 0 0 1-4 4H22a4 4 0 0 1-4-4z" />
      <path className="pic-paper" d="M15 30a6 6 0 0 1 6-10 8 8 0 0 1 14-2 7 7 0 0 1 12 2 5 5 0 0 1 6 10z" />
      <path className="pic-thin" d="M28 42v20M40 42v20" />
    </>
  ),
  // 瓶: a bottle.
  FC189: (
    <>
      <path className="pic-jade-soft" d="M35 14v8c0 4-9 6-9 14v34a4 4 0 0 0 4 4h20a4 4 0 0 0 4-4V36c0-8-9-10-9-14v-8z" />
      <rect className="pic-red" x="34" y="6" width="12" height="8" rx="1" />
      <rect className="pic-paper" x="26" y="44" width="28" height="14" />
    </>
  ),
  // 米饭: a bowl of rice with chopsticks.
  FC194: (
    <>
      <path className="pic-paper" d="M16 42c0-10 10-16 24-16s24 6 24 16z" />
      <path className="pic-thin" d="M30 34l2-2M40 31l2 1M48 36l2-2M36 38l2 1" />
      <path d="M48 8L36 34M60 12L42 36" />
      <Bowl className="pic-blue-soft" />
    </>
  ),
  // 面条: a bowl of noodles lifted with chopsticks.
  FC195: (
    <>
      <path d="M60 4L40 26M68 10L42 28" />
      <path className="pic-gold-line" d="M38 28c-3 4 3 8 0 14M42 28c-3 4 3 8 0 14M46 28c-3 4 3 8 0 14" />
      <Bowl className="pic-red" />
    </>
  ),
  // 面包: a loaf of bread.
  FC196: (
    <>
      <path
        className="pic-soft"
        d="M10 44c0-14 12-22 30-22s30 8 30 22c0 4-4 6-6 6v18a4 4 0 0 1-4 4H20a4 4 0 0 1-4-4V50c-2 0-6-2-6-6z"
      />
      <path className="pic-thin" d="M28 32l4 8M40 30l4 8M52 32l4 8" />
    </>
  ),
  // 披萨: a slice of pizza.
  FC197: (
    <>
      <path className="pic-gold" d="M40 72L14 18c16-8 36-8 52 0z" />
      <path className="pic-soft" d="M14 18c16-8 36-8 52 0l-3 6c-14-7-32-7-46 0z" />
      <g className="pic-red">
        <circle cx="40" cy="33" r="4" />
        <circle cx="31" cy="44" r="3.5" />
        <circle cx="47" cy="48" r="3.5" />
        <circle cx="40" cy="60" r="2.5" />
      </g>
    </>
  ),
  // 汉堡／汉堡包: a hamburger.
  FC198: (
    <>
      <path className="pic-soft" d="M12 40c0-14 12-22 28-22s28 8 28 22z" />
      <path className="pic-thin" d="M30 28l2-1M42 25l2 1M52 31l2-1" />
      <path className="pic-jade" d="M10 44c4 4 8-4 12 0s8-4 12 0 8-4 12 0 8-4 12 0 8-4 12 0" />
      <rect className="pic-amber" x="10" y="48" width="60" height="8" rx="4" />
      <path className="pic-soft" d="M12 60h56v4a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6z" />
    </>
  ),
  // 包子: a steamed bun.
  FC200: (
    <>
      <path className="pic-thin" d="M30 18c-3-4 3-6 0-10M50 18c-3-4 3-6 0-10" />
      <path className="pic-paper" d="M10 60c0-20 14-36 30-36s30 16 30 36c0 4-4 8-8 8H18c-4 0-8-4-8-8z" />
      <path className="pic-thin" d="M40 24l-9 12M40 24l-3 13M40 24l3 13M40 24l9 12" />
    </>
  ),
  // 饺子: a dumpling.
  FC201: (
    <>
      <path className="pic-paper" d="M8 52c0-14 14-26 32-26s32 12 32 26c0 6-14 10-32 10S8 58 8 52z" />
      <path className="pic-thin" d="M22 33l4 8M31 29l2 8M40 27v8M49 29l-2 8M58 33l-4 8" />
    </>
  ),
  // 薯条: french fries in a carton.
  FC202: (
    <>
      <path className="pic-gold" d="M24 14h6v24h-6zM32 8h6v30h-6zM40 14h6v24h-6zM48 9h6v29h-6z" />
      <path className="pic-red" d="M18 30c8 6 36 6 44 0l-6 42H24z" />
    </>
  ),
  // 朋友: two friends arm in arm.
  FC206: (
    <>
      <circle className="pic-soft" cx="26" cy="18" r="7" />
      <circle className="pic-soft" cx="54" cy="18" r="7" />
      <path d="M26 28v22M26 50l-6 20M26 50l6 20M54 28v22M54 50l-6 20M54 50l6 20M26 34l-10 12M54 34l10 12M26 34l14 8 14-8" />
    </>
  ),
  // 喜欢: a heart.
  FC209: (
    <path className="pic-red" d="M40 70S10 50 10 30a15 15 0 0 1 30-6 15 15 0 0 1 30 6c0 20-30 40-30 40z" />
  ),
  // 生日: a birthday cake with candles.
  FC226: (
    <>
      <path className="pic-gold pic-flat" d="M28 20c3 3 3 6 0 7-3-1-3-4 0-7zM40 16c3 3 3 6 0 7-3-1-3-4 0-7zM52 20c3 3 3 6 0 7-3-1-3-4 0-7z" />
      <path className="pic-blue-soft" d="M26 30h4v14h-4zM38 26h4v18h-4zM50 30h4v14h-4z" />
      <path className="pic-soft" d="M14 52h52v18H14z" />
      <path className="pic-paper" d="M14 44h52v8c-4 4-9-3-13 0s-9 4-13 0-9-3-13 0-9 4-13 0z" />
      <path d="M8 70h64" />
    </>
  ),
  // 看电视: a television.
  FC244: (
    <>
      <path d="M30 6l10 12 10-12M40 58v10M28 70h24" />
      <rect className="pic-paper" x="10" y="18" width="60" height="40" rx="4" />
      <rect className="pic-blue-soft" x="16" y="24" width="48" height="28" rx="2" />
    </>
  ),
  // 看电影: a film clapperboard.
  FC245: (
    <>
      <rect className="pic-paper" x="12" y="34" width="56" height="36" rx="2" />
      <path className="pic-thick" d="M20 34l6 10M32 34l6 10M44 34l6 10M56 34l6 10" />
      <path d="M12 44h56" />
      <g transform="rotate(-14 12 34)">
        <rect className="pic-paper" x="12" y="24" width="56" height="10" />
        <path className="pic-thick" d="M20 24l6 10M32 24l6 10M44 24l6 10M56 24l6 10" />
      </g>
    </>
  ),
  // 看书: an open book.
  FC246: (
    <>
      <path className="pic-paper" d="M40 24c-8-6-20-8-30-6v46c10-2 22 0 30 6 8-6 20-8 30-6V18c-10-2-22 0-30 6z" />
      <path d="M40 24v46" />
      <path
        className="pic-thin"
        d="M16 30c6-1 12 0 18 3M16 38c6-1 12 0 18 3M16 46c6-1 12 0 18 3M46 33c6-3 12-4 18-3M46 41c6-3 12-4 18-3M46 49c6-3 12-4 18-3"
      />
    </>
  ),
};
