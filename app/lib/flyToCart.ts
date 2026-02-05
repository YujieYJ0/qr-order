export function flyToCart(sourceEl: HTMLElement, imageSrc?: string | null) {
  if (typeof window === "undefined") return;
  const cartEl = document.getElementById("cart-fab");
  if (!cartEl) return;

  const start = sourceEl.getBoundingClientRect();
  const end = cartEl.getBoundingClientRect();
  const startX = start.left + start.width / 2;
  const startY = start.top + start.height / 2;
  const endX = end.left + end.width / 2;
  const endY = end.top + end.height / 2;

  const fly = document.createElement("div");
  fly.style.position = "fixed";
  fly.style.left = "0px";
  fly.style.top = "0px";
  fly.style.width = "32px";
  fly.style.height = "32px";
  fly.style.borderRadius = "999px";
  fly.style.zIndex = "9999";
  fly.style.pointerEvents = "none";
  fly.style.boxShadow = "0 6px 20px rgba(0,0,0,0.15)";

  if (imageSrc) {
    fly.style.backgroundImage = `url(${imageSrc})`;
    fly.style.backgroundSize = "cover";
    fly.style.backgroundPosition = "center";
  } else {
    fly.style.background = "#F59E0B";
  }

  document.body.appendChild(fly);

  const animation = fly.animate(
    [
      {
        transform: `translate(${startX - 16}px, ${startY - 16}px) scale(1)`,
        opacity: 1,
      },
      {
        transform: `translate(${endX - 8}px, ${endY - 8}px) scale(0.2)`,
        opacity: 0.2,
      },
    ],
    {
      duration: 520,
      easing: "cubic-bezier(0.22, 0.61, 0.36, 1)",
    }
  );

  animation.onfinish = () => {
    fly.remove();
  };
}
