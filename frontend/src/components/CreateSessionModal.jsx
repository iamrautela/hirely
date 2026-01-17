import { Code2Icon, LoaderIcon, PlusIcon, AlertCircleIcon } from "lucide-react";
import { PROBLEMS } from "../data/problems";
import { validateSessionData, getDifficultyColor } from "../lib/sessionUtils";

function CreateSessionModal({
  isOpen,
  onClose,
  roomConfig,
  setRoomConfig,
  onCreateRoom,
  isCreating,
}) {
  const problems = Object.values(PROBLEMS);
  const selectedProblem = problems.find((p) => p.title === roomConfig.problem);
  const validation = validateSessionData(roomConfig);

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <h3 className="font-bold text-2xl mb-6">Create Interview Session</h3>

        <div className="space-y-6">
          {/* PROBLEM SELECTION */}
          <div className="space-y-3">
            <label className="label">
              <span className="label-text font-semibold">Select Coding Problem</span>
              <span className="label-text-alt text-error">*</span>
            </label>

            <select
              className="select w-full border-2 border-base-300 focus:border-primary focus:outline-none"
              value={roomConfig.problem}
              onChange={(e) => {
                const selected = problems.find((p) => p.title === e.target.value);
                setRoomConfig({
                  problem: e.target.value,
                  difficulty: selected?.difficulty || "",
                });
              }}
            >
              <option value="" disabled>
                Choose a coding problem...
              </option>

              {problems.map((problem) => (
                <option key={problem.id} value={problem.title}>
                  {problem.title} ({problem.difficulty})
                </option>
              ))}
            </select>
          </div>

          {/* SESSION SUMMARY */}
          {roomConfig.problem && selectedProblem && (
            <div className="bg-success/10 border border-success/30 rounded-lg p-4 space-y-2">
              <div className="flex items-center gap-2">
                <Code2Icon className="size-5 text-success" />
                <p className="font-semibold text-success">Session Configuration</p>
              </div>

              <div className="ml-7 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Problem:</span>
                  <span className="font-medium">{roomConfig.problem}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-base-content/70">Difficulty:</span>
                  <div className={`badge ${getDifficultyColor(roomConfig.difficulty)}`}>
                    {roomConfig.difficulty}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-base-content/70">Mode:</span>
                  <span className="font-medium">1-on-1 Interview</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-base-content/70">Features:</span>
                  <div className="flex gap-2">
                    <div className="badge badge-outline badge-sm">Video</div>
                    <div className="badge badge-outline badge-sm">Chat</div>
                    <div className="badge badge-outline badge-sm">Code Editor</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VALIDATION ERRORS */}
          {!validation.isValid && roomConfig.problem && (
            <div className="alert alert-error">
              <AlertCircleIcon className="size-5" />
              <div>
                <p className="font-semibold">Configuration Error</p>
                {validation.errors.map((err, idx) => (
                  <p key={idx} className="text-sm">{err}</p>
                ))}
              </div>
            </div>
          )}

          {/* INFO BOX */}
          <div className="alert alert-info">
            <div>
              <p className="font-semibold">Interview Format</p>
              <ul className="list-disc list-inside text-sm mt-2 space-y-1">
                <li>Live video and audio communication</li>
                <li>Shared code editor environment</li>
                <li>Real-time code execution</li>
                <li>Session chat for communication</li>
                <li>Host controls session end</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="modal-action mt-8">
          <button 
            className="btn btn-ghost" 
            onClick={onClose}
            disabled={isCreating}
          >
            Cancel
          </button>

          <button
            className="btn btn-primary gap-2"
            onClick={onCreateRoom}
            disabled={isCreating || !validation.isValid}
          >
            {isCreating ? (
              <>
                <LoaderIcon className="size-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="size-5" />
                Create Session
              </>
            )}
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose}></div>
    </div>
  );
}

export default CreateSessionModal;

