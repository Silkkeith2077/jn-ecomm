import { legalDocuments, type LandingBlock } from "@/lib/landing-content";
import { whatsapp } from "@/lib/data";
import { Icon } from "@/components/icon";

function Block({ block }: { block: LandingBlock }) {
  switch (block.type) {
    case "h2":
      return <h2>{block.text}</h2>;
    case "h3":
      return <h3>{block.text}</h3>;
    case "img":
      return (
        <figure className="legal-figure">
          <img src={block.src} alt={block.alt} loading="lazy" referrerPolicy="no-referrer" />
        </figure>
      );
    case "ul":
      return (
        <ul>
          {block.items.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      );
    default:
      return <p>{block.text}</p>;
  }
}

export function LegalDocuments() {
  const { title, lead, hero, blocks } = legalDocuments;

  return (
    <section className="section legal-intro">
      <div className="legal-hero">
        <div>
          <h1>{title}</h1>
          <p className="legal-lead">{lead}</p>
        </div>
        <img src={hero.src} alt={hero.alt} referrerPolicy="no-referrer" />
      </div>

      <div className="legal-copy">
        {blocks.map((block, i) => <Block key={i} block={block} />)}
      </div>

      <div className="legal-cta">
        <a
          className="button"
          href={whatsapp("Hello Docs2Travel, I would like to buy legal documents online.")}
          target="_blank"
          rel="noreferrer"
        >
          Send us a message <Icon name="arrow" />
        </a>
        <span className="form-note">Via WhatsApp or Telegram. No online payment.</span>
      </div>
    </section>
  );
}