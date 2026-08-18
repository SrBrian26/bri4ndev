export interface TitleSectionProps {
    title: string;
}

export default function TitleSection({ title }: TitleSectionProps) {
    return (
        <p className="text-sm font-semibold text-subtitulo uppercase tracking-widest mb-12">
          {title}
        </p>
    )
}