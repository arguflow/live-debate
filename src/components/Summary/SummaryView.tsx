import { ScrollRelevantElementsIntoViewButton } from "../layouts/ScrollRelevantElementsIntoView";
import { Summary } from "./types";

export interface SummaryViewProps {
  summary: Summary;
  highlighted?: boolean;
}

export const SummaryView = (props: SummaryViewProps) => {
  return (
    <div
      classList={{
        "flex w-full flex-col space-y-2 rounded-md border-2 border-indigo-500 p-2 text-white":
          true,
        "bg-neutral-900": props.highlighted,
      }}
    >
      <div class="grid grid-cols-[18px_1fr]">
        <div class="font-bold">D</div>
        <div>
          <span>{props.summary.summaryContent.description}</span>
        </div>
      </div>
      <ScrollRelevantElementsIntoViewButton
        statementId={props.summary.originalStatementEventId}
        typesToScrollIntoView={["statement", "rebuttal", "counterargument"]}
      />
    </div>
  );
};
