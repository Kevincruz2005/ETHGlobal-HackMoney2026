"use client";

import { useEnsAvatar, useEnsName, useEnsText } from "wagmi";
import { mainnet } from "wagmi/chains";
import { normalize } from "viem/ens";

export type NitroCreatorMetadata = {
  ensName?: string;
  ensAvatar?: string;
  description?: string;
  discountCode?: string;
  saleRate?: number;
  seasonPassDomain?: string;
};

export function useNitroCreatorMetadata(address: `0x${string}`) {
  const { data: ensName } = useEnsName({ address, chainId: mainnet.id });

  const { data: ensAvatar } = useEnsAvatar({
    name: ensName ?? undefined,
    chainId: mainnet.id,
  });

  const normalizedName = ensName ? normalize(ensName) : undefined;

  const { data: description } = useEnsText({
    name: normalizedName,
    key: "description",
    chainId: mainnet.id,
  });

  const { data: discountCode } = useEnsText({
    name: normalizedName,
    key: "nitro.discount_code",
    chainId: mainnet.id,
  });

  const { data: saleRateRaw } = useEnsText({
    name: normalizedName,
    key: "nitro.sale_rate",
    chainId: mainnet.id,
  });

  const { data: seasonPassDomain } = useEnsText({
    name: normalizedName,
    key: "nitro.season_pass_domain",
    chainId: mainnet.id,
  });

  const saleRate = (() => {
    if (!saleRateRaw) return undefined;
    const parsed = Number(saleRateRaw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
  })();

  const metadata: NitroCreatorMetadata = {
    ensName: ensName ?? undefined,
    ensAvatar: ensAvatar ?? undefined,
    description: description ?? undefined,
    discountCode: discountCode ?? undefined,
    saleRate,
    seasonPassDomain: seasonPassDomain ?? undefined,
  };

  return metadata;
}

