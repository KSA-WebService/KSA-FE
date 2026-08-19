"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/page-header";
import { PostFormFields } from "@/components/posts/post-form-fields";
import { Button } from "@/components/ui/button";
import { useCreatePostMutation } from "@/hooks/use-post-detail-query";
import { usePostImages } from "@/hooks/use-post-images";
import { EMPTY_POST_FORM_VALUES, validatePostForm, type PostFormValues } from "@/lib/post-form";
import { hkLocalInputValueToIso } from "@/lib/hk-datetime";
import { ApiError } from "@/lib/api/client";
import { GENERIC_POST_CREATE_ERROR, POST_ERROR_MESSAGES } from "@/lib/post-errors";
import type { PostCreatePayload } from "@/types/api";

// docs/admin/admin-ui.md §9 "New Post". Reuses PostFormFields (shared with
// Post Edit) and usePostImages; only the action bar and submit/cancel
// semantics differ from Edit.
export default function NewPostPage() {
  const router = useRouter();
  const [values, setValues] = useState<PostFormValues>(EMPTY_POST_FORM_VALUES);
  const [errors, setErrors] = useState<ReturnType<typeof validatePostForm>>({});
  const images = usePostImages();
  const createPost = useCreatePostMutation();

  function handleChange(patch: Partial<PostFormValues>) {
    setValues((current) => ({ ...current, ...patch }));
  }

  function buildPayload(status: "draft" | "published"): PostCreatePayload {
    const isEvent = values.categories.includes("event");

    return {
      title: values.title.trim(),
      content: values.content.trim() || undefined,
      categories: values.categories,
      membersOnly: values.membersOnly,
      status,
      ...(isEvent
        ? {
            eventStartAt: hkLocalInputValueToIso(values.eventStartAt) ?? undefined,
            eventEndAt: hkLocalInputValueToIso(values.eventEndAt) ?? undefined,
            showOnCalendar: values.showOnCalendar,
          }
        : { showOnCalendar: false }),
      imageFileIds: images.imageFileIds.length > 0 ? images.imageFileIds : undefined,
    };
  }

  function handleSubmit(status: "draft" | "published") {
    const validationErrors = validatePostForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    if (images.isBusy || createPost.isPending) return;

    createPost.mutate(buildPayload(status), {
      onSuccess: (created) => {
        toast.success(status === "draft" ? "임시 저장되었습니다." : "게시글이 게시되었습니다.");
        // replace, not push: the empty /admin/posts/new form should never
        // become a back-navigation target once a post exists from it.
        router.replace(`/admin/posts/${created.postId}`);
      },
      onError: (error) => {
        const message =
          error instanceof ApiError
            ? (POST_ERROR_MESSAGES[error.errorCode] ?? GENERIC_POST_CREATE_ERROR)
            : GENERIC_POST_CREATE_ERROR;
        toast.error(message);
      },
    });
  }

  function handleCancel() {
    // All images in a New Post session are, by definition, not yet
    // attached to any post -- safe to clean up unconditionally.
    images.cleanupUnattachedNewImages();
    router.push("/admin/posts");
  }

  const isSubmitting = createPost.isPending;

  return (
    <div>
      <div className="px-8 pt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="text-body text-text-secondary transition-colors duration-150 hover:text-brand-800"
        >
          ← Back to Posts
        </button>
      </div>
      <PageHeader title="New Post" />

      <div className="px-8 pb-8">
        <PostFormFields
          values={values}
          onChange={handleChange}
          errors={errors}
          images={images}
          showEventClearedNotice={false}
          disabled={isSubmitting}
        />

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary" onClick={handleCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleSubmit("draft")}
            disabled={isSubmitting || images.isBusy}
          >
            Save Draft
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={isSubmitting || images.isBusy}>
            Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
