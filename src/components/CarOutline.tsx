/**
 * Silhouette de véhicule utilisée comme repère de cadrage pendant la prise
 * des 4 photos guidées (avant/arrière/gauche/droite). Un seul tracé "face"
 * (avant/arrière) et un seul tracé "profil" (gauche, reflété pour la droite)
 * suffisent : ce n'est qu'un gabarit de cadrage, pas une illustration réaliste.
 */
export function CarOutline({
  angle,
  className,
}: {
  angle: "front" | "back" | "left" | "right";
  className?: string;
}) {
  const isSide = angle === "left" || angle === "right";

  return (
    <svg
      viewBox={isSide ? "0 0 200 100" : "0 0 200 140"}
      className={className}
      style={angle === "right" ? { transform: "scaleX(-1)" } : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeDasharray="7 6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {isSide ? (
        <>
          <path d="M15,70 L15,52 Q15,42 27,40 L48,40 Q60,22 82,22 L118,22 Q140,22 152,40 L173,40 Q185,42 185,52 L185,70 Z" />
          <circle cx="50" cy="75" r="14" />
          <circle cx="150" cy="75" r="14" />
        </>
      ) : (
        <>
          <rect x="35" y="25" width="130" height="90" rx="18" />
          <circle cx="62" cy="55" r="9" />
          <circle cx="138" cy="55" r="9" />
          <line x1="35" y1="115" x2="165" y2="115" />
        </>
      )}
    </svg>
  );
}
