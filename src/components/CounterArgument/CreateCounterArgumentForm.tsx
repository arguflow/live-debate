import {
  Accessor,
  createEffect,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { Event } from "nostr-tools";
import InputRowsForm from "../Atoms/InputRowsForm";
import { CreateCounterArgumentParams } from "./types";
import { GlobalContext } from "~/contexts/GlobalContext";
import { implementsRebuttalContent } from "../Rebuttals/types";
import { Combobox, comboboxItem } from "../Atoms/Combobox";
import { CreateWarrantFormWithButton } from "../Warrants/CreateWarrantFormWithButton";
import { CreateWarrantParams } from "../Warrants/types";

export interface CreateCounterArgumentFormProps {
  previousEvent: Accessor<Event | undefined>;
  onCancel: () => void;
  onCreateCounterArgument: ({
    counterArgumentContent,
  }: CreateCounterArgumentParams) => void;
  warrantOptions: Accessor<comboboxItem[]>;
  onCreateWarrant: ({ warrantContent }: CreateWarrantParams) => void;
}

export const CreateCounterArgumentForm = (
  props: CreateCounterArgumentFormProps,
) => {
  const globalContext = useContext(GlobalContext);
  const [selectedComboboxItems, setSelectedComboboxItems] = createSignal<
    comboboxItem[]
  >([]);
  const [getDescription, setDescription] = createSignal("");
  const [creating, setCreating] = createSignal(false);

  const warrantOrImpact = createMemo((): "warrant" | "impact" => {
    const previousEvent = props.previousEvent();
    if (!previousEvent) return "impact";
    const previousEventContent: unknown = JSON.parse(previousEvent.content);
    if (previousEventContent && typeof previousEventContent !== "object")
      return "impact";
    if (!("rebuttalContent" in (previousEventContent as object)))
      return "impact";
    const previousEventRebuttalContent: unknown = (
      previousEventContent as {
        rebuttalContent: unknown;
      }
    ).rebuttalContent;

    if (implementsRebuttalContent(previousEventRebuttalContent)) {
      return previousEventRebuttalContent.counterWarrants &&
        previousEventRebuttalContent.counterWarrants.length > 0
        ? "warrant"
        : "impact";
    }
    return "impact";
  });

  createEffect(() => {
    if (!creating()) return;
    if (
      getDescription() === "" ||
      (warrantOrImpact() === "warrant" && !selectedComboboxItems().length)
    ) {
      globalContext.createToast({
        type: "error",
        message: "Please fill out all fields",
      });
      setCreating(false);
      return;
    }
    const previousEvent = props.previousEvent();
    if (!previousEvent) {
      globalContext.createToast({
        type: "error",
        message: "No previous event",
      });
      setCreating(false);
      return;
    }
    props.onCreateCounterArgument({
      counterArgumentContent: {
        counterWarrants: selectedComboboxItems(),
        description: getDescription(),
      },
    });
    setCreating(false);
  });

  return (
    <div>
      {props.previousEvent() ? (
        warrantOrImpact() === "impact" ? (
          <InputRowsForm
            createButtonText="Create Impact CounterArgument"
            inputGroups={[
              {
                label: "Description",
                inputValue: getDescription,
                setInputValue: setDescription,
                type: "textarea",
              },
            ]}
            onCreate={() => setCreating(true)}
            onCancel={props.onCancel}
          />
        ) : (
          <InputRowsForm
            createButtonText="Create Warrant CounterArgument"
            inputGroups={[
              {
                label: "Counter Warrants",
                component: (
                  <Combobox
                    options={props.warrantOptions}
                    selected={selectedComboboxItems}
                    onSelect={(option: comboboxItem) => {
                      setSelectedComboboxItems((prev) => {
                        const prevIncludesOption = prev.find((prevOption) => {
                          return prevOption.eventId === option.eventId;
                        });
                        if (!prevIncludesOption) {
                          return [...prev, option];
                        }
                        return prev.filter(
                          (prevOption) => prevOption.eventId !== option.eventId,
                        );
                      });
                    }}
                    aboveOptionsElement={
                      <CreateWarrantFormWithButton
                        onCreateWarrant={props.onCreateWarrant}
                      />
                    }
                  />
                ),
              },
              {
                label: "Description",
                inputValue: getDescription,
                setInputValue: setDescription,
                type: "textarea",
              },
            ]}
            onCreate={() => setCreating(true)}
            onCancel={props.onCancel}
          />
        )
      ) : (
        <div />
      )}
    </div>
  );
};
