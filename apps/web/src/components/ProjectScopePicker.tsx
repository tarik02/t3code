import {
  CheckIcon,
  ChevronDownIcon,
  EllipsisIcon,
  FolderIcon,
  PlusIcon,
  SearchIcon,
  SettingsIcon,
  TagsIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";

import { normalizeProjectTags, projectMatchesTagFilters } from "../projectTags";
import type { SidebarProjectSnapshot } from "../sidebarProjectGrouping";
import { ProjectFavicon } from "./ProjectFavicon";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "./ui/dialog";
import { Empty, EmptyDescription, EmptyHeader } from "./ui/empty";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Fieldset, FieldsetLegend } from "./ui/fieldset";
import { Form } from "./ui/form";
import { Input } from "./ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "./ui/input-group";
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "./ui/menu";
import { Popover, PopoverPopup, PopoverTitle, PopoverTrigger } from "./ui/popover";
import { SidebarMenuButton } from "./ui/sidebar";
import { Spinner } from "./ui/spinner";

interface ProjectScopePickerProps {
  readonly groups: ReadonlyArray<SidebarProjectSnapshot>;
  readonly open: boolean;
  readonly selectedProjectKey: string | null;
  readonly selectedTags: ReadonlyArray<string>;
  readonly onOpenChange: (open: boolean) => void;
  readonly onSelectedProjectKeyChange: (projectKey: string | null) => void;
  readonly onSelectedTagsChange: (tags: string[]) => void;
  readonly onOpenSettings: (group: SidebarProjectSnapshot) => void;
  readonly onToggleProjectTag: (group: SidebarProjectSnapshot, tag: string) => void;
  readonly onCreateProjectTag: (group: SidebarProjectSnapshot) => void;
}

function ProjectTagBadges({ tags }: { readonly tags: ReadonlyArray<string> }) {
  if (tags.length === 0) return null;
  return (
    <span className="ms-auto flex min-w-0 max-w-[45%] items-center gap-1 overflow-hidden">
      {tags.map((tag) => (
        <Badge key={tag} size="sm" variant="secondary" className="max-w-20 truncate">
          {tag}
        </Badge>
      ))}
    </span>
  );
}

function ProjectActionsMenu({
  group,
  availableTags,
  onOpenSettings,
  onToggleProjectTag,
  onCreateProjectTag,
}: {
  readonly group: SidebarProjectSnapshot;
  readonly availableTags: ReadonlyArray<string>;
  readonly onOpenSettings: (group: SidebarProjectSnapshot) => void;
  readonly onToggleProjectTag: (group: SidebarProjectSnapshot, tag: string) => void;
  readonly onCreateProjectTag: (group: SidebarProjectSnapshot) => void;
}) {
  const attachedTags = new Set(group.tags.map((tag) => tag.toLocaleLowerCase()));
  return (
    <Menu>
      <MenuTrigger
        render={
          <Button
            size="icon-xs"
            variant="ghost-muted"
            aria-label={`Project menu for ${group.displayName}`}
            title={`Project menu for ${group.displayName}`}
          />
        }
      >
        <EllipsisIcon />
      </MenuTrigger>
      <MenuPopup align="end" className="w-44">
        <MenuGroup>
          <MenuItem onClick={() => onOpenSettings(group)}>
            <SettingsIcon />
            Settings
          </MenuItem>
          <MenuSub>
            <MenuSubTrigger>
              <TagsIcon />
              Tags
            </MenuSubTrigger>
            <MenuSubPopup className="w-48">
              {availableTags.length > 0 ? (
                <>
                  <MenuGroup>
                    <MenuGroupLabel>Attach tags</MenuGroupLabel>
                    {availableTags.map((tag) => (
                      <MenuCheckboxItem
                        key={tag}
                        checked={attachedTags.has(tag.toLocaleLowerCase())}
                        closeOnClick={false}
                        onCheckedChange={() => onToggleProjectTag(group, tag)}
                      >
                        <span className="truncate">{tag}</span>
                      </MenuCheckboxItem>
                    ))}
                  </MenuGroup>
                  <MenuSeparator />
                </>
              ) : null}
              <MenuGroup>
                <MenuItem onClick={() => onCreateProjectTag(group)}>
                  <PlusIcon />
                  Create new tag
                </MenuItem>
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}

export function ProjectScopePicker({
  groups,
  open,
  selectedProjectKey,
  selectedTags,
  onOpenChange,
  onSelectedProjectKeyChange,
  onSelectedTagsChange,
  onOpenSettings,
  onToggleProjectTag,
  onCreateProjectTag,
}: ProjectScopePickerProps) {
  const [query, setQuery] = useState("");
  const selectedGroup =
    selectedProjectKey === null
      ? null
      : (groups.find((group) => group.projectKey === selectedProjectKey) ?? null);
  const availableTags = useMemo(
    () => normalizeProjectTags(groups.flatMap((group) => group.tags)),
    [groups],
  );
  const selectedTagKeys = useMemo(
    () => new Set(selectedTags.map((tag) => tag.toLocaleLowerCase())),
    [selectedTags],
  );
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleTags = normalizeProjectTags([
    ...selectedTags,
    ...availableTags.filter(
      (tag) => normalizedQuery.length === 0 || tag.toLocaleLowerCase().includes(normalizedQuery),
    ),
  ]);
  const visibleGroups = groups.filter((group) => {
    if (!projectMatchesTagFilters(group.tags, selectedTags)) return false;
    if (normalizedQuery.length === 0) return true;
    return (
      group.displayName.toLocaleLowerCase().includes(normalizedQuery) ||
      group.tags.some((tag) => tag.toLocaleLowerCase().includes(normalizedQuery))
    );
  });

  const changeOpen = (nextOpen: boolean) => {
    if (!nextOpen) setQuery("");
    onOpenChange(nextOpen);
  };
  const selectProject = (projectKey: string | null) => {
    onSelectedProjectKeyChange(projectKey);
    changeOpen(false);
  };
  const changeTagFilter = (tag: string, checked: boolean) => {
    const nextTags = checked
      ? normalizeProjectTags([...selectedTags, tag])
      : selectedTags.filter(
          (candidate) => candidate.toLocaleLowerCase() !== tag.toLocaleLowerCase(),
        );
    onSelectedTagsChange(nextTags);
    if (selectedGroup !== null && !projectMatchesTagFilters(selectedGroup.tags, nextTags)) {
      onSelectedProjectKeyChange(null);
    }
  };

  return (
    <Popover open={open} onOpenChange={changeOpen}>
      <PopoverTrigger
        render={
          <SidebarMenuButton
            aria-label="Filter threads by project or tag"
            className="min-w-0 flex-1 ps-[calc(var(--sidebar-row-content-inset)-1px)] focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
          />
        }
      >
        {selectedGroup ? (
          <ProjectFavicon
            environmentId={selectedGroup.environmentId}
            cwd={selectedGroup.workspaceRoot}
            faviconPath={selectedGroup.faviconPath}
            className="size-4 shrink-0"
          />
        ) : selectedTags.length > 0 ? (
          <TagsIcon />
        ) : (
          <FolderIcon />
        )}
        <span className="min-w-0 flex-1 truncate">
          {selectedGroup?.displayName ??
            (selectedTags.length > 0
              ? `${selectedTags.length} ${selectedTags.length === 1 ? "tag" : "tags"}`
              : "All projects")}
        </span>
        {selectedGroup !== null && selectedTags.length > 0 ? (
          <Badge size="sm" variant="secondary">
            {selectedTags.length}
          </Badge>
        ) : null}
        <ChevronDownIcon />
      </PopoverTrigger>
      <PopoverPopup
        align="start"
        className="w-80 max-w-[calc(100vw-2rem)]"
        viewportClassName="flex flex-col gap-1 p-1"
      >
        <PopoverTitle className="sr-only">Filter projects</PopoverTitle>
        <InputGroup variant="ghost">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            autoFocus
            size="sm"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
            placeholder="Search projects or tags"
            aria-label="Search projects or tags"
          />
          {query.length > 0 ? (
            <InputGroupAddon align="inline-end">
              <Button
                size="icon-micro"
                variant="ghost-muted"
                aria-label="Clear project search"
                onClick={() => setQuery("")}
              >
                <XIcon />
              </Button>
            </InputGroupAddon>
          ) : null}
        </InputGroup>

        {visibleTags.length > 0 ? (
          <Fieldset className="min-w-0 max-w-none gap-0 px-1 pb-1">
            <FieldsetLegend className="sr-only">Filter by tag</FieldsetLegend>
            <div
              className="flex min-w-0 max-w-full touch-pan-x gap-0.5 overflow-x-auto overflow-y-hidden overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              onWheel={(event) => {
                const tagRow = event.currentTarget;
                if (
                  Math.abs(event.deltaY) <= Math.abs(event.deltaX) ||
                  tagRow.scrollWidth <= tagRow.clientWidth
                ) {
                  return;
                }
                event.preventDefault();
                tagRow.scrollLeft += event.deltaY;
              }}
            >
              {visibleTags.map((tag) => (
                <label
                  key={tag}
                  className="flex min-h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-sm px-1.5 text-sm hover:bg-accent"
                >
                  <Checkbox
                    checked={selectedTagKeys.has(tag.toLocaleLowerCase())}
                    onCheckedChange={(checked) => changeTagFilter(tag, checked)}
                  />
                  <span className="truncate">{tag}</span>
                </label>
              ))}
            </div>
          </Fieldset>
        ) : null}

        <div className="flex max-h-72 flex-col gap-1 overflow-y-auto" aria-label="Projects">
          {normalizedQuery.length === 0 ? (
            <Button
              size="sm"
              variant={selectedProjectKey === null ? "secondary" : "ghost"}
              className="w-full justify-start px-2"
              onClick={() => selectProject(null)}
            >
              {selectedProjectKey === null ? <CheckIcon /> : <FolderIcon />}
              <span className="truncate">
                {selectedTags.length > 0 ? "All matching projects" : "All projects"}
              </span>
            </Button>
          ) : null}
          {visibleGroups.map((group) => (
            <div key={group.projectKey} className="flex min-w-0 items-center gap-1">
              <Button
                size="sm"
                variant={selectedProjectKey === group.projectKey ? "secondary" : "ghost"}
                className="min-w-0 flex-1 justify-start px-2"
                onClick={() => selectProject(group.projectKey)}
              >
                <ProjectFavicon
                  environmentId={group.environmentId}
                  cwd={group.workspaceRoot}
                  faviconPath={group.faviconPath}
                  className="size-4 shrink-0"
                />
                <span className="min-w-0 flex-1 truncate text-left">{group.displayName}</span>
                <ProjectTagBadges tags={group.tags} />
              </Button>
              <ProjectActionsMenu
                group={group}
                availableTags={availableTags}
                onOpenSettings={(selected) => {
                  changeOpen(false);
                  onOpenSettings(selected);
                }}
                onToggleProjectTag={onToggleProjectTag}
                onCreateProjectTag={(selected) => {
                  changeOpen(false);
                  onCreateProjectTag(selected);
                }}
              />
            </div>
          ))}
          {visibleGroups.length === 0 ? (
            <Empty role="status" className="gap-0 p-4">
              <EmptyHeader>
                <EmptyDescription>No projects match this filter</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
        </div>
      </PopoverPopup>
    </Popover>
  );
}

interface CreateProjectTagDialogProps {
  readonly group: SidebarProjectSnapshot | null;
  readonly onClose: () => void;
  readonly onCreate: (group: SidebarProjectSnapshot, tag: string) => Promise<boolean>;
}

export function CreateProjectTagDialog({ group, onClose, onCreate }: CreateProjectTagDialogProps) {
  const [tag, setTag] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTag("");
    setError(null);
    setSaving(false);
  }, [group?.projectKey]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (group === null || saving) return;
    const label = tag.trim();
    if (label.length === 0) {
      setError("Enter a tag name.");
      return;
    }
    setSaving(true);
    const created = await onCreate(group, label);
    setSaving(false);
    if (created) onClose();
  };

  return (
    <Dialog
      open={group !== null}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !saving) onClose();
      }}
    >
      <DialogPopup className="sm:max-w-sm">
        <Form onSubmit={submit} className="min-h-0 gap-0">
          <DialogHeader>
            <DialogTitle>Create project tag</DialogTitle>
            <DialogDescription>
              {group === null
                ? "Add a reusable project label."
                : `Add a tag to ${group.displayName}.`}
            </DialogDescription>
          </DialogHeader>
          <DialogPanel>
            <Field data-invalid={error !== null}>
              <FieldLabel htmlFor="new-project-tag">Tag name</FieldLabel>
              <Input
                id="new-project-tag"
                autoFocus
                value={tag}
                onChange={(event) => {
                  setTag(event.currentTarget.value);
                  setError(null);
                }}
                aria-invalid={error !== null}
                placeholder="frontend"
              />
              {error !== null ? <FieldError>{error}</FieldError> : null}
            </Field>
          </DialogPanel>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={saving} onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <PlusIcon data-icon="inline-start" />
              )}
              {saving ? "Adding..." : "Add tag"}
            </Button>
          </DialogFooter>
        </Form>
      </DialogPopup>
    </Dialog>
  );
}
