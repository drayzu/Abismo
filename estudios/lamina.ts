/**
 * The sheet (key I): what the journey does not stop to explain. One per act, by the act's id.
 *
 * Only act IV's is written, because the rules of care ask for it there (BRIEF § Cuidado, 5 and 7):
 * it names suicide plainly, says that the thought is common and that depression is treated, and
 * says where to find help. It is a draft: its sources are still to be completed.
 */

export interface Lamina {
  titulo: string;
  parrafos: string[];
  /** Where to find help; drawn apart, at the foot. */
  ayuda?: string[];
}

export const LAMINAS: Record<string, Lamina> = {
  fondo: {
    titulo: 'El fondo',
    parrafos: [
      'Esta parte de la obra habla de pensar en el suicidio. Lo dice con esa palabra, sin rodeos, porque callarlo no protege a nadie.',
      'Pensarlo no es raro, y no es una falla tuya. Mucha gente pasa por ahí, y casi nadie lo cuenta.',
      'La tristeza y la depresión no son lo mismo. La depresión es una enfermedad frecuente, y tiene tratamiento.',
      'Desde dentro todo parece definitivo. Mucha gente que estuvo ahí cuenta, después, que no lo era.',
    ],
    ayuda: ['Si lo estás pensando, habla hoy con alguien.', 'findahelpline.com', 'Líneas de ayuda de tu país, gratis.'],
  },
};

/** The act that replaced the study has the same sheet. */
LAMINAS.acto4 = LAMINAS.fondo;

export const SIN_LAMINA: Lamina = { titulo: 'Lámina', parrafos: ['La lámina de esta parte todavía no está escrita.'] };
