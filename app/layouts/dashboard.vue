<script setup lang="ts">
import { HugeiconsIcon } from "@hugeicons/vue";
import { LinkSquare02Icon, News01Icon } from "@hugeicons/core-free-icons";

const route = useRoute();

const nav = [{ title: "Posts", to: "/dashboard/posts", icon: News01Icon }];

const pageTitle = computed(() => (route.meta.title as string | undefined) ?? "Dashboard");

const { site } = useAppConfig();

useHead({ titleTemplate: (title) => (title ? `${title} · Dashboard` : "Dashboard") });
</script>

<template>
  <SidebarProvider>
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <NuxtLink to="/dashboard">
                <BrandMark />
                <div class="grid flex-1 text-left text-sm leading-tight">
                  <span class="truncate font-[family-name:var(--font-heading)] font-semibold">{{ site.name }}</span>
                  <span class="text-muted-foreground truncate text-xs">Dashboard</span>
                </div>
              </NuxtLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in nav" :key="item.to">
                <SidebarMenuButton as-child :is-active="route.path.startsWith(item.to)" :tooltip="item.title">
                  <NuxtLink :to="item.to">
                    <HugeiconsIcon :icon="item.icon" />
                    <span>{{ item.title }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>

    <SidebarInset class="min-w-0">
      <header class="bg-background sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger class="-ml-1" />
        <Separator orientation="vertical" class="mr-2 !h-4" />
        <h1 class="text-sm font-medium">{{ pageTitle }}</h1>
        <div class="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="sm" as-child>
            <NuxtLink to="/" target="_blank">
              <HugeiconsIcon :icon="LinkSquare02Icon" class="size-4" />
              <span class="hidden sm:inline">View site</span>
            </NuxtLink>
          </Button>
          <BrandThemeToggle />
        </div>
      </header>
      <main class="min-w-0 flex-1 p-4 md:p-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
