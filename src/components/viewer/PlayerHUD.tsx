import {For, Show} from "../conversion/helpers";
import { characterNameByInternalId } from "../../common/ids";
import { useReplayStore } from "../../state/replayStoreReact";
import { useCallback } from "react";
import React from "react";
export function PlayerHUD(props: { player: number }) {
  const storeRenderDatas = useReplayStore((state) => state.renderDatas);

  const renderData = useCallback(() => {
    const newData = storeRenderDatas.find(
      (renderData) =>
        renderData.playerSettings.playerIndex === props.player &&
        renderData.playerState.isNana === false
    )
    return newData
  }, [storeRenderDatas, props.player]);

  // const renderData = () => {
  //   const newData = storeRenderDatas.find(
  //     (renderData) =>
  //       renderData.playerSettings.playerIndex === props.player &&
  //       renderData.playerState.isNana === false
  //   )
  //   console.log('storeRenderDatas', storeRenderDatas)
  //   console.log('renderData()', newData)
  //   return newData
  // };
  const position = () => ({
    x: -30 + 20 * props.player, // ports at: -30%, -10%, 10%, 30%
    y: 40, // y% is flipped by css to make the text right-side up.
  });

  const name = () =>
    renderData()
      ? [
          renderData()!.playerSettings.displayName,
          renderData()!.playerSettings.connectCode,
          renderData()!.playerSettings.nametag,
          renderData()!.playerSettings.displayName,
          characterNameByInternalId[
            renderData()!.playerState.internalCharacterId
          ],
        ].find((n) => n !== undefined && n.length > 0)
      : "";

  return (
    <>
      <Show when={!!renderData()}>
        <For each={Array(renderData()!.playerState.stocksRemaining).fill(0)}>
          {(_, i) => (
            <React.Fragment key={i}>
            <circle
              cx={`${position().x - 2 * (1.5 - i)}%`}
              cy={`-${position().y}%`}
              r={5}
              fill={renderData()!.innerColor}
              stroke="black"
            />
            </React.Fragment>
          )}
        </For>
        <text
          style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
          x={`${position().x}%`}
          y={`${position().y + 4}%`}
          textAnchor="middle"
          textcontent={`${Math.floor(renderData()!.playerState.percent)}%`}
          fill={renderData()!.innerColor}
          stroke="black"
        />
        <text
          style={{ font: "bold 15px sans-serif", transform: "scaleY(-1)" }}
          x={`${position().x}%`}
          y={`${position().y + 7}%`}
          textAnchor="middle"
          textcontent={name()}
          fill={renderData()!.innerColor}
          stroke="black"
        />
      </Show>
    </>
  );
}