"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Tutor } from "@/app/consultations/get-tutors-action";
import { CreateConsultationForm } from "@/app/dashboard/create-consultation-form";

interface Props {
  currentUserId: string;
  tutors: Tutor[];
}

export function ScheduleConsultationButton({ currentUserId, tutors }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [defaultDate, setDefaultDate] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    function handleCancel() {
      setDefaultDate("");
    }
    dialog.addEventListener("cancel", handleCancel);
    dialog.addEventListener("close", handleCancel);
    return () => {
      dialog.removeEventListener("cancel", handleCancel);
      dialog.removeEventListener("close", handleCancel);
    };
  }, []);

  function open() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    setDefaultDate(`${yyyy}-${mm}-${dd}`);
    dialogRef.current?.showModal();
  }

  function close() {
    dialogRef.current?.close();
  }

  function handleSuccess() {
    close();
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-primary fixed bottom-6 right-6 shadow-lg"
        onClick={open}
      >
        Schedule New Consultation
      </button>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box w-full max-w-lg">
          <h3 className="font-bold text-lg mb-4">Schedule New Consultation</h3>
          {defaultDate && (
            <CreateConsultationForm
              currentUserId={currentUserId}
              defaultDate={defaultDate}
              tutors={tutors}
              onSuccess={handleSuccess}
              onCancel={close}
            />
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="submit">close</button>
        </form>
      </dialog>
    </>
  );
}
