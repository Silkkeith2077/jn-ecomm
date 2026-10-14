import {ContactForm} from "@/components/store";
import {ContactMap} from "@/components/contact-map";
import {brand, whatsapp} from "@/lib/data";
import {SocialIcon} from "@/components/social-icon";

export const metadata = {
    title: "Contact",
    description: "Speak with a Docs2Travel advisor on WhatsApp or Telegram.",
};

export default function Contact() {
    return (
        <section className="section">
            <div className="page-intro">
                <h1>Let’s talk.<br/><em>We’re listening.</em></h1>
                <p>Message an advisor directly on WhatsApp or Telegram — or send an inquiry below.</p>
            </div>

            <div className="contact-grid">
                <div>
                    <div className="contact-channels">
                        <a className="button"
                           href={whatsapp("Hello Docs2Travel! I would like to speak with an advisor.")} target="_blank"
                           rel="noreferrer">
                            <SocialIcon name="whatsapp"/> Chat on WhatsApp
                        </a>
                        <a className="button" href={brand.telegram} target="_blank" rel="noreferrer">
                            <SocialIcon name="telegram"/> Message on Telegram
                        </a>
                    </div>

                    <dl className="contact-details">
                        <div>
                            <dt>WhatsApp</dt>
                            <dd><a href={`tel:+${brand.whatsapp}`}>{brand.phone}</a></dd>
                        </div>
                        <div>
                            <dt>Telegram</dt>
                            <dd>
                                <a href={brand.telegram} target="_blank" rel="noreferrer">@{brand.telegramHandle}</a>
                            </dd>
                        </div>
                        {brand.email && (
                            <div>
                                <dt>Email</dt>
                                <dd><a href={`mailto:${brand.email}`}>{brand.email}</a></dd>
                            </div>
                        )}
                    </dl>

                    <ContactMap/>
                </div>

                <ContactForm/>
            </div>
        </section>
    );
}