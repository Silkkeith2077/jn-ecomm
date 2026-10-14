import {type LandingBlock, legalDocuments} from "@/lib/landing-content";
import {whatsapp} from "@/lib/data";
import {Icon} from "@/components/icon";

function Block({block}: { block: LandingBlock }) {
    switch (block.type) {
        case "h2":
            return <h2>{block.text}</h2>;
        case "h3":
            return <h3>{block.text}</h3>;
        case "img":
            return (
                <figure className="legal-figure">
                    <img src={block.src} alt={block.alt} loading="lazy" referrerPolicy="no-referrer"/>
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
    const {title, lead, hero, blocks} = legalDocuments;

    // Everything from the final image onward renders as the closing two-column block.
    const split = blocks.map((b) => b.type).lastIndexOf("img");
    const body = split === -1 ? blocks : blocks.slice(0, split);
    const closing = split === -1 ? [] : blocks.slice(split);
    const [closingImage, ...closingCopy] = closing;

    const cta = (
        <div className="legal-cta">
            <a
                className="button"
                href={whatsapp("Hello Docs2Travel, I would like to buy legal documents online.")}
                target="_blank"
                rel="noreferrer"
            >
                Send us a message <Icon name="arrow"/>
            </a>
            <span className="form-note">Via WhatsApp or Telegram. No online payment.</span>
        </div>
    );

    return (
        <section className="section documents legal-intro">
            <div className="legal-hero">
                <div>
                    <h1>{title}</h1>
                    <p className="legal-lead">{lead}</p>
                </div>
                <img src={hero.src} alt={hero.alt} referrerPolicy="no-referrer"/>
            </div>

            <div className="legal-copy">
                {body.map((block, i) => <Block key={i} block={block}/>)}
            </div>

            {closingImage ? (
                <div className="legal-closing">
                    <div className="legal-closing-media">
                        <Block block={closingImage}/>
                    </div>
                    <div className="legal-closing-copy">
                        {closingCopy.map((block, i) => <Block key={i} block={block}/>)}
                        {cta}
                    </div>
                </div>
            ) : cta}
        </section>
    );
}