<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import {
  Add01Icon,
  Delete02Icon,
  Edit02Icon,
  Image01Icon,
  Loading03Icon,
  News01Icon,
  Search01Icon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";
import { watchDebounced } from "@vueuse/core";
import { toast } from "vue-sonner";

definePageMeta({ layout: "dashboard", title: "Posts" });
useHead({ title: "Posts" });

const route = useRoute();
const router = useRouter();

// ----- List state lives in the URL so filters survive reloads and can be shared -----
const SORTS = {
  "createdAt:desc": "Newest first",
  "createdAt:asc": "Oldest first",
  "updatedAt:desc": "Recently updated",
  "publishedAt:desc": "Recently published",
  "title:asc": "Title A–Z",
  "title:desc": "Title Z–A",
} as const;
type SortKey = keyof typeof SORTS;

const queryString = (key: string) => {
  const value = route.query[key];
  return typeof value === "string" && value ? value : undefined;
};

const sort = computed<SortKey>(() => {
  const value = `${queryString("sortBy") ?? "createdAt"}:${queryString("order") ?? "desc"}`;
  return value in SORTS ? (value as SortKey) : "createdAt:desc";
});

const listQuery = computed(() => {
  const [sortBy, order] = sort.value.split(":");
  return {
    page: Math.max(1, Number(queryString("page")) || 1),
    limit: 10,
    search: queryString("search"),
    status: queryString("status"),
    category: queryString("category"),
    sortBy,
    order,
  };
});

function setQuery(patch: Record<string, string | number | undefined>, resetPage = true) {
  const next: Record<string, string> = {};
  for (const [key, value] of Object.entries({ ...route.query, ...(resetPage && { page: undefined }), ...patch })) {
    if (value !== undefined && value !== null && value !== "" && value !== "all") next[key] = String(value);
  }
  router.replace({ query: next });
}

const search = ref(queryString("search") ?? "");
watchDebounced(search, (value) => setQuery({ search: value.trim() || undefined }), { debounce: 350 });

const statusFilter = computed({
  get: () => queryString("status") ?? "all",
  set: (value: string) => setQuery({ status: value }),
});
const categoryFilter = computed({
  get: () => queryString("category") ?? "all",
  set: (value: string) => setQuery({ category: value }),
});
const sortModel = computed({
  get: () => sort.value,
  set: (value: SortKey) => {
    const [sortBy, order] = value.split(":");
    setQuery({ sortBy, order });
  },
});

const hasFilters = computed(() => !!(listQuery.value.search || listQuery.value.status || listQuery.value.category));
function clearFilters() {
  search.value = "";
  setQuery({ search: undefined, status: undefined, category: undefined });
}

// ----- Data -----
const { data, status, error, refresh } = await useFetch<Paginated<PostListItem>>("/api/posts", { query: listQuery });
const { data: categories } = await useFetch<Paginated<Category>>("/api/categories", {
  query: { limit: 100, sortBy: "name" },
});

const posts = computed(() => data.value?.data ?? []);
const meta = computed(() => data.value?.meta);
const loading = computed(() => status.value === "pending");

const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });
const formatDate = (value: string | null) => (value ? dateFormat.format(new Date(value)) : "—");

// ----- Create / edit -----
const sheetOpen = ref(false);
const editingId = ref<string | null>(null);

function openCreate() {
  editingId.value = null;
  sheetOpen.value = true;
}
function openEdit(post: PostListItem) {
  editingId.value = post.id;
  sheetOpen.value = true;
}

// ----- Publish toggle -----
const togglingId = ref<string | null>(null);

async function toggleStatus(post: PostListItem) {
  const next = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  togglingId.value = post.id;
  try {
    await $fetch(`/api/posts/${post.id}`, { method: "PATCH", body: { status: next } });
    toast.success(next === "PUBLISHED" ? "Post published" : "Post moved to drafts");
    await refresh();
  } catch (e) {
    toast.error(errorMessage(e, "Could not update the post"));
  } finally {
    togglingId.value = null;
  }
}

// ----- Sticky columns: opaque backgrounds so scrolled cells don't show through, matching the row hover -----
const stickyBase = "sticky z-10 bg-background";
const stickyRowHover = "group-hover/row:bg-[color-mix(in_oklab,var(--muted)_50%,var(--background))]";
const stickyLeft = `${stickyBase} left-0 shadow-[inset_-1px_0_0_var(--border)]`;
const stickyRight = `${stickyBase} right-0 shadow-[inset_1px_0_0_var(--border)]`;

// ----- Delete (soft) with undo -----
const deleteTarget = ref<PostListItem | null>(null);
const deleting = ref(false);

async function confirmDelete() {
  const post = deleteTarget.value;
  if (!post) return;
  deleting.value = true;
  try {
    await $fetch(`/api/posts/${post.id}`, { method: "DELETE" });
    deleteTarget.value = null;
    toast.success(`"${post.title}" deleted`, {
      action: { label: "Undo", onClick: () => restore(post) },
    });
    // Step back a page when the last row of a page was deleted
    if (posts.value.length === 1 && listQuery.value.page > 1) setQuery({ page: listQuery.value.page - 1 }, false);
    else await refresh();
  } catch (e) {
    toast.error(errorMessage(e, "Could not delete the post"));
  } finally {
    deleting.value = false;
  }
}

async function restore(post: PostListItem) {
  try {
    await $fetch(`/api/posts/${post.id}/restore`, { method: "PATCH" });
    toast.success(`"${post.title}" restored`);
    await refresh();
  } catch (e) {
    toast.error(errorMessage(e, "Could not restore the post"));
  }
}
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-4">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-semibold tracking-tight">Posts</h2>
        <p class="text-muted-foreground text-sm">Create, edit and manage your blog posts.</p>
      </div>
      <Button @click="openCreate">
        <HugeiconsIcon :icon="Add01Icon" class="size-4" />
        New post
      </Button>
    </div>

    <!-- Toolbar -->
    <div class="flex flex-col gap-2 md:flex-row md:items-center">
      <div class="relative md:max-w-sm md:flex-1">
        <HugeiconsIcon :icon="Search01Icon" class="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input v-model="search" placeholder="Search title, excerpt or content…" class="pl-9" aria-label="Search posts" />
      </div>
      <div class="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        <Select v-model="statusFilter">
          <SelectTrigger class="w-full sm:w-36" aria-label="Filter by status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="PUBLISHED">Published</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="categoryFilter">
          <SelectTrigger class="w-full sm:w-44" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem v-for="c in categories?.data ?? []" :key="c.id" :value="c.slug">{{ c.name }}</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="sortModel">
          <SelectTrigger class="col-span-2 w-full sm:w-44" aria-label="Sort posts">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem v-for="(label, value) in SORTS" :key="value" :value="value">{{ label }}</SelectItem>
          </SelectContent>
        </Select>
        <Button v-if="hasFilters" variant="ghost" class="col-span-2 sm:col-span-1" @click="clearFilters">
          Clear filters
        </Button>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow class="hover:bg-transparent">
            <TableHead :class="[stickyLeft, 'w-16 pl-3']"><span class="sr-only">Cover</span></TableHead>
            <TableHead>Post</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Published</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead :class="[stickyRight, 'w-px pr-3 text-right']">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody :class="loading && posts.length ? 'opacity-60 transition-opacity' : ''">
          <template v-if="loading && !posts.length">
            <TableRow v-for="i in 5" :key="i">
              <TableCell :class="[stickyLeft, 'pl-3']"><Skeleton class="size-10 rounded-md" /></TableCell>
              <TableCell>
                <div class="flex flex-col gap-1.5"><Skeleton class="h-4 w-48" /><Skeleton class="h-3 w-32" /></div>
              </TableCell>
              <TableCell><Skeleton class="h-5 w-16" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-5 w-24" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell><Skeleton class="h-4 w-20" /></TableCell>
              <TableCell :class="[stickyRight, 'pr-3']">
                <div class="flex justify-end gap-1"><Skeleton v-for="n in 3" :key="n" class="size-8 rounded-md" /></div>
              </TableCell>
            </TableRow>
          </template>

          <TableRow v-else-if="error">
            <TableCell colspan="8" class="h-40 text-center">
              <p class="text-sm">{{ errorMessage(error, "Could not load posts") }}</p>
              <Button variant="outline" size="sm" class="mt-3" @click="() => refresh()">Try again</Button>
            </TableCell>
          </TableRow>

          <TableRow v-else-if="!posts.length">
            <TableCell colspan="8" class="h-48 text-center">
              <div class="flex flex-col items-center gap-2">
                <HugeiconsIcon :icon="News01Icon" class="text-muted-foreground size-8" />
                <p class="font-medium">{{ hasFilters ? "No posts match your filters" : "No posts yet" }}</p>
                <Button v-if="hasFilters" variant="outline" size="sm" @click="clearFilters">Clear filters</Button>
                <Button v-else size="sm" @click="openCreate">Write your first post</Button>
              </div>
            </TableCell>
          </TableRow>

          <TableRow v-for="post in posts" v-else :key="post.id" class="group/row">
            <TableCell :class="[stickyLeft, stickyRowHover, 'pl-3']">
              <button
                type="button"
                class="bg-muted focus-visible:ring-ring/50 flex size-10 items-center justify-center overflow-hidden rounded-md border outline-none focus-visible:ring-3"
                :aria-label="`Edit ${post.title}`"
                tabindex="-1"
                @click="openEdit(post)"
              >
                <img v-if="post.coverImage" :src="post.coverImage.url" alt="" class="size-full object-cover" loading="lazy">
                <HugeiconsIcon v-else :icon="Image01Icon" class="text-muted-foreground size-4" />
              </button>
            </TableCell>
            <TableCell>
              <button type="button" class="group flex w-72 flex-col text-left xl:w-96" :title="post.title" @click="openEdit(post)">
                <span class="truncate font-medium group-hover:underline">{{ post.title }}</span>
                <span class="text-muted-foreground truncate text-xs">/{{ post.slug }}</span>
              </button>
            </TableCell>
            <TableCell><PostStatusBadge :status="post.status" /></TableCell>
            <TableCell class="whitespace-nowrap">
              <span v-if="post.category">{{ post.category.name }}</span>
              <span v-else class="text-muted-foreground">—</span>
            </TableCell>
            <TableCell>
              <div class="flex gap-1">
                <Badge v-for="tag in post.tags.slice(0, 2)" :key="tag.id" variant="outline">{{ tag.name }}</Badge>
                <Badge v-if="post.tags.length > 2" variant="outline">+{{ post.tags.length - 2 }}</Badge>
                <span v-if="!post.tags.length" class="text-muted-foreground">—</span>
              </div>
            </TableCell>
            <TableCell class="text-muted-foreground whitespace-nowrap">{{ formatDate(post.publishedAt) }}</TableCell>
            <TableCell class="text-muted-foreground whitespace-nowrap">{{ formatDate(post.updatedAt) }}</TableCell>
            <TableCell :class="[stickyRight, stickyRowHover, 'pr-3']">
              <div class="flex justify-end gap-1">
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button variant="ghost" size="icon-sm" :aria-label="`Edit ${post.title}`" @click="openEdit(post)">
                      <HugeiconsIcon :icon="Edit02Icon" class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      :disabled="togglingId === post.id"
                      :aria-label="`${post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'} ${post.title}`"
                      @click="toggleStatus(post)"
                    >
                      <HugeiconsIcon
                        :icon="togglingId === post.id ? Loading03Icon : post.status === 'PUBLISHED' ? ViewOffSlashIcon : ViewIcon"
                        :class="['size-4', togglingId === post.id && 'animate-spin']"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{{ post.status === "PUBLISHED" ? "Unpublish" : "Publish" }}</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger as-child>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      :aria-label="`Delete ${post.title}`"
                      @click="deleteTarget = post"
                    >
                      <HugeiconsIcon :icon="Delete02Icon" class="size-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="meta && meta.total > 0" class="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p class="text-muted-foreground text-sm">
        Showing {{ (meta.page - 1) * meta.limit + 1 }}–{{ Math.min(meta.page * meta.limit, meta.total) }} of {{ meta.total }}
      </p>
      <Pagination
        v-if="meta.totalPages > 1"
        v-slot="{ page }"
        :page="meta.page"
        :total="meta.total"
        :items-per-page="meta.limit"
        :sibling-count="1"
        show-edges
        class="mx-0 w-auto"
        @update:page="(p: number) => setQuery({ page: p }, false)"
      >
        <PaginationContent v-slot="{ items }">
          <PaginationPrevious />
          <template v-for="(item, index) in items" :key="index">
            <PaginationItem v-if="item.type === 'page'" :value="item.value" :is-active="item.value === page">
              {{ item.value }}
            </PaginationItem>
            <PaginationEllipsis v-else :index="index" />
          </template>
          <PaginationNext />
        </PaginationContent>
      </Pagination>
    </div>

    <PostSheet v-model:open="sheetOpen" :post-id="editingId" @saved="() => refresh()" />

    <AlertDialog :open="!!deleteTarget" @update:open="(value) => !value && !deleting && (deleteTarget = null)">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this post?</AlertDialogTitle>
          <AlertDialogDescription>
            "{{ deleteTarget?.title }}" will be removed from the blog. You can undo this right after deleting.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel :disabled="deleting">Cancel</AlertDialogCancel>
          <Button variant="destructive" :disabled="deleting" @click="confirmDelete">
            {{ deleting ? "Deleting…" : "Delete" }}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
