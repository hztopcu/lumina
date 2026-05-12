import { LuminaClient } from "@/components/lumina/LuminaClient";
import { getKindleSenderDisplayEmail } from "@/lib/kindle-sender-display";

export function LuminaHome() {
  const kindleSenderDisplay = getKindleSenderDisplayEmail();
  return <LuminaClient kindleSenderDisplay={kindleSenderDisplay} />;
}
