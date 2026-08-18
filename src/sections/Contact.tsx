import ContactAside from "../components/ContactAside";
import ContactForm from "../components/ContactForm";
import TitleSection from "../components/TitleSection";

export default function Contact() {
  return (
    <section
      id="contact"
      className="flex min-h-screen items-start"
    >
      <div className="mx-auto max-w-5xl px-6 py-26">
        <TitleSection title="Contacto" />

        <p className="mb-2 max-w-xl text-lg leading-relaxed text-zinc-300">
          ¿Tienes una idea o proyecto en mente? Me encantaría trabajar contigo.
        </p>

        <p className="mb-8 max-w-xl text-md leading-relaxed text-zinc-350">
          Escribeme a través del formulario o directamente a mi correo electrónico.
        </p>

        <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_520px]">
          <ContactForm />
          <ContactAside />
        </div>
      </div>
    </section>
  );
}
