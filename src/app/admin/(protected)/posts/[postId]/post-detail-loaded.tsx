"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PostFormFields } from "@/components/posts/post-form-fields";
import { AccessBadge, CategoryBadge, PostStatusBadge } from "@/components/posts/post-badges";
import { DateTime } from "@/components/admin/date-time";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import { useUpdatePostMutation } from "@/hooks/use-post-detail-query";
import { usePostImages } from "@/hooks/use-post-images";
import { postDetailToFormValues, validatePostForm, type PostFormValues } from "@/lib/post-form";
import { hkLocalInputValueToIso } from "@/lib/hk-datetime";
import { ApiError } from "@/lib/api/client";
import { GENERIC_POST_SAVE_ERROR, POST_ERROR_MESSAGES } from "@/lib/post-errors";
import type { PostDetail, PostStatus, PostUpdatePayload } from "@/types/api";

function arraysEqual<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

interface PostDetailLoadedProps {
  postId: string;
  detail: PostDetail;
}

// docs/admin/admin-ui.md §8. View Mode first, same-page Edit Mode.
// Remounted by the parent (key={detail.updatedAt}) after every successful
// save, so all state below is safe to initialize once from `detail`.
export function PostDetailLoaded({ postId, detail }: PostDetailLoadedProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [initialValues] = useState<PostFormValues>(() => postDetailToFormValues(detail));
  const [values, setValues] = useState<PostFormValues>(initialValues);
  const [errors, setErrors] = useState<ReturnType<typeof validatePostForm>>({});
  const [hidePostOpen, setHidePostOpen] = useState(false);
  const images = usePostImages(detail.images);
  const updatePost = useUpdatePostMutation(postId);

  const hadEventInitially = initialValues.categories.includes("event");
  const showEventClearedNotice = hadEventInitially && !values.categories.includes("event");
  const isSubmitting = updatePost.isPending;

  function handleChange(patch: Partial<PostFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  // Send only changed fields, except an Event-category removal must also
  // send the explicit cleanup fields (admin-ui.md "Save Behavior").
  function buildDiffPayload(targetStatus?: PostStatus): PostUpdatePayload {
    const payload: PostUpdatePayload = {};

    if (values.title !== initialValues.title) payload.title = values.title.trim();
    if (values.content !== initialValues.content) payload.content = values.content.trim() || null;
    if (!arraysEqual(values.categories, initialValues.categories)) payload.categories = values.categories;
    if (values.membersOnly !== initialValues.membersOnly) payload.membersOnly = values.membersOnly;

    const isEvent = values.categories.includes("event");
    if (isEvent) {
      const newStart = hkLocalInputValueToIso(values.eventStartAt);
      const newEnd = hkLocalInputValueToIso(values.eventEndAt);
      if (newStart !== hkLocalInputValueToIso(initialValues.eventStartAt)) payload.eventStartAt = newStart;
      if (newEnd !== hkLocalInputValueToIso(initialValues.eventEndAt)) payload.eventEndAt = newEnd;
      if (values.showOnCalendar !== initialValues.showOnCalendar) payload.showOnCalendar = values.showOnCalendar;
    } else if (hadEventInitially) {
      payload.eventStartAt = null;
      payload.eventEndAt = null;
      payload.showOnCalendar = false;
    }

    if (!arraysEqual(images.imageFileIds, images.originalFileIds)) {
      payload.imageFileIds = images.imageFileIds;
    }

    if (targetStatus) payload.status = targetStatus;

    return payload;
  }

  function submitUpdate(payload: PostUpdatePayload, successMessage: string) {
    updatePost.mutate(payload, {
      onSuccess: () => {
        // Safe now that the PATCH (which detaches them) has succeeded --
        // never delete before that.
        images.cleanupRemovedOriginalImages();
        setHidePostOpen(false);
        setIsEditing(false);
        toast.success(successMessage);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? (POST_ERROR_MESSAGES[error.errorCode] ?? GENERIC_POST_SAVE_ERROR)
            : GENERIC_POST_SAVE_ERROR;
        toast.error(message);
      },
    });
  }

  function handleSave(targetStatus?: PostStatus) {
    const validationErrors = validatePostForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0 || images.isBusy || isSubmitting) return;

    submitUpdate(
      buildDiffPayload(targetStatus),
      targetStatus === "published" ? "게시글이 게시되었습니다." : "게시글이 저장되었습니다.",
    );
  }

  function handleHidePost() {
    // Deliberately independent of the form's other pending edits -- Hide
    // Post is a separate, confirmation-gated destructive action, not the
    // primary save flow (docs/admin/admin-ui.md §8 "Published" actions).
    submitUpdate({ status: "hidden" }, "게시글이 저장되었습니다.");
  }

  function handleCancelEdit() {
    images.cleanupUnattachedNewImages();
    setValues(initialValues);
    setErrors({});
    setIsEditing(false);
  }

  if (!isEditing) {
    return (
      <div className="px-8 pt-8 pb-8">
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
        >
          ← Back to Posts
        </button>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-page-title font-bold text-text-primary">{detail.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <PostStatusBadge status={detail.status} />
              {detail.categories.map((category) => (
                <CategoryBadge key={category} category={category} />
              ))}
              <AccessBadge membersOnly={detail.membersOnly} />
            </div>
          </div>
          <Button onClick={() => setIsEditing(true)}>Edit Post</Button>
        </div>

        {detail.images.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {detail.images
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((image) => (
                <div
                  key={image.contentImageId}
                  className="relative aspect-[4/5] overflow-hidden rounded-control border border-border bg-surface-muted"
                >
                  {/* unoptimized: this is an admin verification view of the
                      original uploaded file, at most 4 images -- bypass the
                      /_next/image optimizer entirely so no recompressed
                      derivative is ever served here (Post List thumbnails
                      still go through it). object-contain (not -cover):
                      show the complete image, never crop it. */}
                  <Image src={image.fileUrl} alt="" fill unoptimized className="object-contain" />
                </div>
              ))}
          </div>
        )}

        <section className="mt-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Content</h2>
          <p className="mt-2 whitespace-pre-wrap text-body text-text-primary">{detail.content || "—"}</p>
        </section>

        {detail.categories.includes("event") && (
          <section className="mt-6 rounded-surface border border-border bg-surface p-6">
            <h2 className="text-section-heading font-semibold text-text-primary">Event Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Field label="Event Start" value={<DateTime value={detail.eventStartAt} />} />
              <Field label="Event End" value={<DateTime value={detail.eventEndAt} />} />
              <Field label="Show on Calendar" value={detail.showOnCalendar ? "Yes" : "No"} />
            </dl>
          </section>
        )}

        <section className="mt-6 rounded-surface border border-border bg-surface p-6">
          <h2 className="text-section-heading font-semibold text-text-primary">Post Information</h2>
          <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Author" value={detail.author.name} />
            <Field label="Published At" value={<DateTime value={detail.publishedAt} />} />
            <Field label="Created At" value={<DateTime value={detail.createdAt} />} />
            <Field label="Updated At" value={<DateTime value={detail.updatedAt} />} />
          </dl>
        </section>
      </div>
    );
  }

  return (
    <div className="px-8 pt-8 pb-8">
      <button
        type="button"
        onClick={handleCancelEdit}
        className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
      >
        ← Back to Posts
      </button>

      <PageHeader title="Edit Post" />

      <PostFormFields
        values={values}
        onChange={handleChange}
        errors={errors}
        images={images}
        showEventClearedNotice={showEventClearedNotice}
        disabled={isSubmitting}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          {detail.status === "published" && (
            <Button variant="destructive" onClick={() => setHidePostOpen(true)} disabled={isSubmitting}>
              Hide Post
            </Button>
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleCancelEdit} disabled={isSubmitting}>
            Cancel
          </Button>
          {detail.status === "draft" && (
            <>
              <Button variant="secondary" onClick={() => handleSave()} disabled={isSubmitting || images.isBusy}>
                Save Draft
              </Button>
              <Button onClick={() => handleSave("published")} disabled={isSubmitting || images.isBusy}>
                Publish
              </Button>
            </>
          )}
          {detail.status === "published" && (
            <Button onClick={() => handleSave()} disabled={isSubmitting || images.isBusy}>
              Save Changes
            </Button>
          )}
          {detail.status === "hidden" && (
            <>
              <Button variant="secondary" onClick={() => handleSave()} disabled={isSubmitting || images.isBusy}>
                Save Changes
              </Button>
              <Button onClick={() => handleSave("published")} disabled={isSubmitting || images.isBusy}>
                Publish
              </Button>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={hidePostOpen}
        onOpenChange={setHidePostOpen}
        title="Hide Post"
        description="이 게시글을 숨기시겠습니까? 숨긴 게시글은 사용자에게 표시되지 않습니다."
        confirmLabel="Hide Post"
        variant="destructive"
        onConfirm={handleHidePost}
        isConfirming={isSubmitting}
      />
    </div>
  );
}

function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="text-meta font-medium text-text-secondary">{label}</dt>
      <dd className="mt-0.5 text-body text-text-primary">{value}</dd>
    </div>
  );
}
