<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { useForm } from "vee-validate";
import { z } from "zod";
import { toast } from "vue-sonner";
import { HugeiconsIcon } from "@hugeicons/vue";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { toTypedSchema } from "~/lib/form";

// Reusable create/edit form: pass `post` to edit, omit it to create
const props = defineProps<{ post?: Post | null }>();
const emit = defineEmits<{ saved: [post: Post]; cancel: [] }>();

const isEdit = computed(() => !!props.post);

const schema = z.object({
  title: z.string().trim().min(1, "Title is required").max(200, "Title is too long (max 200)"),
  slug: z
    .string()
    .trim()
    .max(120, "Slug is too long (max 120)")
    .regex(/^([a-z0-9]+(?:-[a-z0-9]+)*)?$/, "Use lowercase letters, numbers and single hyphens"),
  excerpt: z.string().trim().max(500, "Excerpt is too long (max 500)"),
  content: z.string().refine((html) => html.trim() !== "", "Content is required"),
  coverImage: z.object({ url: z.string(), name: z.string() }).nullable(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  categoryId: z.string().nullable(),
  tagIds: z.array(z.string()).max(20, "Up to 20 tags"),
});
type FormValues = z.input<typeof schema>;

function toFormValues(post?: Post | null): FormValues {
  return {
    title: post?.title ?? "",
    slug: post?.slug ?? "",
    excerpt: post?.excerpt ?? "",
    content: post?.content ?? "",
    coverImage: post?.coverImage ?? null,
    status: post?.status ?? "DRAFT",
    categoryId: post?.category?.id ?? null,
    tagIds: post?.tags.map((t) => t.id) ?? [],
  };
}

const { defineField, handleSubmit, errors, meta, isSubmitting, submitCount, resetForm, setFieldError } = useForm({
  validationSchema: toTypedSchema(schema),
  initialValues: toFormValues(props.post),
});

// Like react-hook-form's default mode: validate on blur, re-validate on every change once a field has an error or after submit
const fieldConfig = (state: { errors: string[] }) => ({
  validateOnModelUpdate: state.errors.length > 0 || submitCount.value > 0,
});

const [title, titleAttrs] = defineField("title", fieldConfig);
const [slug, slugAttrs] = defineField("slug", fieldConfig);
const [excerpt, excerptAttrs] = defineField("excerpt", fieldConfig);
const [content, contentAttrs] = defineField("content", fieldConfig);
const [coverImage, coverImageAttrs] = defineField("coverImage", fieldConfig);
const [status] = defineField("status");
const [categoryId, categoryAttrs] = defineField("categoryId", fieldConfig);
const [tagIds, tagAttrs] = defineField("tagIds", fieldConfig);

// The picker works with id arrays; a post has at most one category
const categoryIds = computed({
  get: () => (categoryId.value ? [categoryId.value] : []),
  set: (ids: string[]) => (categoryId.value = ids[0] ?? null),
});

const slugPreview = computed(() => slugify(title.value ?? ""));

// Images uploaded while this form is open; any not used when saving (or all of them, on discard) are deleted
const { remove: removeAssets } = useAssets();
const sessionUploads = new Set<string>();
const trackUploads = (assets: Asset[]) => assets.forEach((a) => sessionUploads.add(a.name));

const initialCategory = computed(() => (props.post?.category ? [props.post.category] : []));

function applyServerErrors(error: unknown) {
  const body = (error as { data?: { statusCode?: number; message?: string; data?: { issues?: { path: string; message: string }[] } } }).data;
  const message = body?.message ?? errorMessage(error, "Could not save the post");

  if (body?.data?.issues?.length) {
    for (const issue of body.data.issues) setFieldError(issue.path.split(".")[0] as keyof FormValues, issue.message);
    return;
  }
  if (body?.statusCode === 409 && /slug/i.test(message)) return setFieldError("slug", "This slug is already in use");
  if (/category/i.test(message)) return setFieldError("categoryId", message);
  if (/tag/i.test(message)) return setFieldError("tagIds", message);
  toast.error(message);
}

const onSubmit = handleSubmit(async (values) => {
  const body = {
    title: values.title,
    // Empty slug: the server generates one on create, and an existing slug is kept on edit
    ...(values.slug ? { slug: values.slug } : {}),
    excerpt: values.excerpt || null,
    content: values.content,
    coverImage: values.coverImage,
    status: values.status,
    categoryId: values.categoryId,
    tagIds: values.tagIds,
  };

  try {
    const saved = props.post
      ? await $fetch<Post>(`/api/posts/${props.post.id}`, { method: "PATCH", body })
      : await $fetch<Post>("/api/posts", { method: "POST", body });

    const used = new Set(extractAssetNames(saved.content));
    if (saved.coverImage) used.add(saved.coverImage.name);
    removeAssets([...sessionUploads].filter((name) => !used.has(name)));
    sessionUploads.clear();

    resetForm({ values: toFormValues(saved) });
    toast.success(isEdit.value ? "Post updated" : "Post created");
    emit("saved", saved);
  } catch (error) {
    applyServerErrors(error);
  }
});

// Leaving without saving: nothing uploaded here is referenced by a saved post
onBeforeUnmount(() => {
  if (sessionUploads.size) removeAssets([...sessionUploads]);
});

useEventListener(window, "beforeunload", (event) => {
  if (meta.value.dirty) event.preventDefault();
});

defineExpose({ isDirty: computed(() => meta.value.dirty), isSubmitting });
</script>

<template>
  <form class="flex min-h-0 flex-1 flex-col" novalidate @submit="onSubmit">
    <div class="flex-1 overflow-y-auto px-6 py-5">
      <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <FieldGroup class="gap-5">
          <Field :data-invalid="!!errors.title">
            <FieldLabel for="post-title">Title</FieldLabel>
            <Input
              id="post-title"
              v-model="title"
              v-bind="titleAttrs"
              placeholder="An interesting title"
              :aria-invalid="!!errors.title"
            />
            <FieldError :errors="errors.title ? [errors.title] : []" />
          </Field>

          <Field :data-invalid="!!errors.slug">
            <FieldLabel for="post-slug">Slug</FieldLabel>
            <Input
              id="post-slug"
              v-model="slug"
              v-bind="slugAttrs"
              :placeholder="slugPreview || 'generated-from-title'"
              :aria-invalid="!!errors.slug"
            />
            <FieldDescription v-if="!errors.slug">
              {{ isEdit ? "Changing the slug changes the post's URL." : "Leave empty to generate it from the title." }}
            </FieldDescription>
            <FieldError :errors="errors.slug ? [errors.slug] : []" />
          </Field>

          <Field :data-invalid="!!errors.excerpt">
            <FieldLabel for="post-excerpt">Excerpt</FieldLabel>
            <Textarea
              id="post-excerpt"
              v-model="excerpt"
              v-bind="excerptAttrs"
              rows="3"
              placeholder="A short summary shown in post lists"
              :aria-invalid="!!errors.excerpt"
            />
            <FieldError :errors="errors.excerpt ? [errors.excerpt] : []" />
          </Field>

          <Field :data-invalid="!!errors.content">
            <FieldLabel for="post-content">Content</FieldLabel>
            <RichTextEditor
              id="post-content"
              v-model="content"
              :invalid="!!errors.content"
              :disabled="isSubmitting"
              @blur="contentAttrs.onBlur"
              @uploaded="trackUploads"
            />
            <FieldError :errors="errors.content ? [errors.content] : []" />
          </Field>
        </FieldGroup>

        <FieldGroup class="gap-5">
          <Field>
            <FieldLabel for="post-status">Status</FieldLabel>
            <Select v-model="status">
              <SelectTrigger id="post-status" class="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Field :data-invalid="!!errors.categoryId">
            <FieldLabel for="post-category">Category</FieldLabel>
            <TaxonomyPicker
              id="post-category"
              v-model="categoryIds"
              endpoint="/api/categories"
              noun="category"
              :initial-options="initialCategory"
              :invalid="!!errors.categoryId"
              @blur="categoryAttrs.onBlur"
            />
            <FieldError :errors="errors.categoryId ? [errors.categoryId] : []" />
          </Field>

          <Field :data-invalid="!!errors.tagIds">
            <FieldLabel for="post-tags">Tags</FieldLabel>
            <TaxonomyPicker
              id="post-tags"
              v-model="tagIds"
              endpoint="/api/tags"
              noun="tag"
              multiple
              :max="20"
              placeholder="Add tags…"
              :initial-options="post?.tags"
              :invalid="!!errors.tagIds"
              @blur="tagAttrs.onBlur"
            />
            <FieldError :errors="errors.tagIds ? [errors.tagIds] : []" />
          </Field>

          <Field :data-invalid="!!errors.coverImage">
            <FieldLabel for="post-cover">Cover image</FieldLabel>
            <ImageUpload
              id="post-cover"
              v-model="coverImage"
              :invalid="!!errors.coverImage"
              :disabled="isSubmitting"
              @blur="coverImageAttrs.onBlur"
              @uploaded="(asset) => trackUploads([asset])"
            />
            <FieldError :errors="errors.coverImage ? [errors.coverImage] : []" />
          </Field>
        </FieldGroup>
      </div>
    </div>

    <div class="bg-background flex items-center justify-end gap-2 border-t px-6 py-4">
      <Button type="button" variant="outline" :disabled="isSubmitting" @click="emit('cancel')">
        Cancel
      </Button>
      <Button type="submit" :disabled="isSubmitting || (isEdit && !meta.dirty)">
        <HugeiconsIcon v-if="isSubmitting" :icon="Loading03Icon" class="size-4 animate-spin" />
        {{ isEdit ? "Save changes" : "Create post" }}
      </Button>
    </div>
  </form>
</template>
