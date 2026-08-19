"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/admin/date-time-picker";
import { CategoryMultiSelect } from "./category-multiselect";
import { PostImagesSection } from "./post-images-section";
import type { PostFormErrors, PostFormValues } from "@/lib/post-form";
import type { UsePostImagesResult } from "@/hooks/use-post-images";

interface PostFormFieldsProps {
  values: PostFormValues;
  onChange: (patch: Partial<PostFormValues>) => void;
  errors: PostFormErrors;
  images: UsePostImagesResult;
  /** True once "Event" has been removed from categories during this session. */
  showEventClearedNotice: boolean;
  disabled?: boolean;
}

// Shared between New Post and Post Edit -- docs/admin/admin-ui.md §8/§9
// "reuse the same field structure". Form layout order per both specs:
// Basic Information, Content, Event Settings (conditional), Images.
export function PostFormFields({
  values,
  onChange,
  errors,
  images,
  showEventClearedNotice,
  disabled,
}: PostFormFieldsProps) {
  const isEvent = values.categories.includes("event");

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-section-heading font-semibold text-text-primary">Basic Information</h2>

        <div>
          <label htmlFor="post-title" className="text-meta font-medium text-text-secondary">
            Title
          </label>
          <Input
            id="post-title"
            value={values.title}
            onChange={(event) => onChange({ title: event.target.value })}
            disabled={disabled}
            className="mt-1"
          />
          {errors.title && <p className="mt-1 text-meta text-destructive">{errors.title}</p>}
        </div>

        <div>
          <label className="text-meta font-medium text-text-secondary">Categories</label>
          <div className="mt-1">
            <CategoryMultiSelect
              value={values.categories}
              onChange={(categories) => onChange({ categories })}
              disabled={disabled}
            />
          </div>
          {errors.categories && <p className="mt-1 text-meta text-destructive">{errors.categories}</p>}
          {showEventClearedNotice && (
            <p className="mt-1 text-meta text-text-secondary">
              Event 카테고리를 제거하면 이벤트 일정과 캘린더 표시 설정도 초기화됩니다.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between rounded-control border border-border px-3 py-2">
          <label htmlFor="post-members-only" className="text-body text-text-primary">
            Members Only
          </label>
          <Switch
            id="post-members-only"
            checked={values.membersOnly}
            onCheckedChange={(checked) => onChange({ membersOnly: checked })}
            disabled={disabled}
          />
        </div>
      </section>

      <section>
        <h2 className="text-section-heading font-semibold text-text-primary">Content</h2>
        <Textarea
          value={values.content}
          onChange={(event) => onChange({ content: event.target.value })}
          disabled={disabled}
          rows={10}
          className="mt-2"
        />
      </section>

      {isEvent && (
        <section className="space-y-4">
          <h2 className="text-section-heading font-semibold text-text-primary">Event Settings</h2>

          <div>
            <label htmlFor="event-start" className="text-meta font-medium text-text-secondary">
              Event Start
            </label>
            <div className="mt-1">
              <DateTimePicker
                id="event-start"
                value={values.eventStartAt}
                onChange={(value) => onChange({ eventStartAt: value })}
                disabled={disabled}
              />
            </div>
            {errors.eventStart && <p className="mt-1 text-meta text-destructive">{errors.eventStart}</p>}
          </div>

          <div>
            <label htmlFor="event-end" className="text-meta font-medium text-text-secondary">
              Event End
            </label>
            <div className="mt-1">
              <DateTimePicker
                id="event-end"
                value={values.eventEndAt}
                onChange={(value) => onChange({ eventEndAt: value })}
                disabled={disabled}
              />
            </div>
            {errors.eventEnd && <p className="mt-1 text-meta text-destructive">{errors.eventEnd}</p>}
          </div>

          <div className="flex items-center justify-between rounded-control border border-border px-3 py-2">
            <label htmlFor="show-on-calendar" className="text-body text-text-primary">
              Show on Calendar
            </label>
            <Switch
              id="show-on-calendar"
              checked={values.showOnCalendar}
              onCheckedChange={(checked) => onChange({ showOnCalendar: checked })}
              disabled={disabled}
            />
          </div>
        </section>
      )}

      <section>
        <PostImagesSection images={images} />
      </section>
    </div>
  );
}
