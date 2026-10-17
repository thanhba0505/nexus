# Nexus UI/UX Design System — Refinement & Engineering Rules

Act as a senior macOS product designer and frontend engineer. Your responsibility is to improve the visual quality, usability, and consistency of the existing Nexus application without unnecessarily redesigning its established visual identity.

This is a real desktop application, not a landing page or a generic SaaS dashboard. Every design decision must serve the product, its workflows, and the macOS desktop experience.

---

## 1. First: Understand the Existing Application

Before changing code:

1. Inspect the current application structure, framework, styling system, shared components, and existing design conventions.
2. Review the main window, settings dialog, navigation, buttons, forms, lists, tables, tooltips, and status indicators.
3. Identify visual inconsistencies, unnecessary borders, awkward spacing, weak hierarchy, cramped layouts, and interactions that feel unfinished.
4. Preserve existing business logic, application behavior, data flow, and working features.
5. Reuse existing components and design tokens wherever practical.

Do not rewrite the application, replace the UI framework, or introduce new dependencies just to improve its appearance.

Do not start implementing until you understand how the current UI is structured.

---

## 2. Preserve the Nexus Visual Identity

The existing dark desktop aesthetic is intentional and should remain the foundation.

### Overall direction

- Dark-first, sophisticated, restrained, technical, and professional.
- Inspired by carefully crafted developer tools and native desktop applications.
- Compact enough for daily productivity, but never cramped.
- Strong visual hierarchy without excessive decoration.
- App-specific brand accents for primary actions, focus, selection, and important interactive elements, orchestrated under the Mini-App Palette Identity Architecture.
- Neutral dark surfaces with subtle tonal differences.
- Fine borders only where they clarify grouping or separation.
- Crisp typography, consistent alignment, and predictable interaction patterns.

The result should feel like a mature macOS productivity application developed by a team with a clear design vision.

Do not change the entire color palette simply to make the interface look different.

---

## 3. Color and Surface Rules

Use the existing palette as the starting point. Inspect the actual color tokens before introducing new values.

Organize colors into semantic roles:

- **App background**: the deepest neutral surface.
- **Primary surface**: the main working area.
- **Secondary surface**: panels, sidebars, and grouped content.
- **Elevated surface**: dialogs, popovers, and menus.
- **Primary text**: high-contrast, readable text.
- **Secondary text**: supporting descriptions and metadata.
- **Muted text**: timestamps and low-priority information.
- **Border**: subtle separation between related surfaces.
- **Accent**: application-specific brand accent token (see Section 3.1).
- **Semantic colors**: success, warning, error, and informational states.

### Rules:

- Establish hierarchy through subtle surface differences instead of surrounding every element with a border.
- Avoid pure black and pure white as the default for every surface and text element.
- Do not use multiple competing accent colors within the same app without a clear semantic purpose.
- Avoid decorative gradients, glowing borders, excessive shadows, and unnecessary glassmorphism.
- Reserve bright accent colors for elements that deserve attention.
- Ensure disabled and secondary controls remain distinguishable without competing with primary actions.
- Maintain sufficient contrast for readable text and essential UI elements.
- Make light and dark appearances consistent if both are supported.

### 3.1. Mini-App Palette Identity Architecture (Hệ Thống Bảng Màu Nhận Diện Độc Lập)

Để mang lại trải nghiệm đa nhiệm trực quan trên macOS (giúp người dùng phân biệt tức thì ứng dụng đang thao tác trên Dock, Mission Control, hoặc Stage Manager), Nexus áp dụng **Mô hình Bảng Màu Nhận Diện Độc Lập**.

Mỗi mini app trong monorepo sở hữu một **Brand Accent Color** riêng biệt, thay vì bị ép buộc dùng chung một màu đồng nhất:

| Ứng Dụng               | Brand Accent Name                              | Hex Code       | Tailwind Token                  | Ý Nghĩa Nhận Diện & Trải Nghiệm macOS                                                                                                       |
| :--------------------- | :--------------------------------------------- | :------------- | :------------------------------ | :------------------------------------------------------------------------------------------------------------------------------------------ |
| **Nexus Launcher**     | Indigo / Royal Purple                          | `#6366f1`      | `indigo-500`                    | Sâu lắng, quyền lực, đóng vai trò trạm chỉ huy trung tâm (Command Center host).                                                             |
| **GitHub Report**      | Sky Blue / Cyan                                | `#0ea5e9`      | `sky-500`                       | Tươi sáng, phản ánh màu trời và công nghệ phát triển phần mềm (Dev & Git tools).                                                            |
| **SlackBot**           | Electric Violet / Slack Aubergine              | `#8b5cf6`      | `violet-500`                    | Lấy cảm hứng từ sắc tím thương hiệu Aubergine đặc trưng của Slack, hiện đại và năng động.                                                   |
| **2D Pet**             | Mint / Teal                                    | `#00c49a`      | `teal-500` / `#00c49a`          | Xanh ngọc Mint/Teal tươi trẻ, thân thiện cho nhân vật đồng hành ảo macOS (Desktop Mascot & Companion).                                      |
| **Ứng dụng tương lai** | Context-driven (Emerald, Amber, Rose, Teal...) | Tự do lựa chọn | e.g. `emerald-500`, `amber-500` | Linh hoạt theo ngữ cảnh: Finance/Monitoring (`#10b981`), Alert/Status (`#f59e0b`), Deadline/Analytics (`#f43f5e`), Cloud/Infra (`#14b8a6`). |

#### Công Thức Ánh Xạ Semantic Accent Tokens Cho Từng App:

Mỗi mini app kế thừa nền tối đồng nhất (Dark Acrylic Neutral Surfaces) và mở rộng biến thể màu nhận diện của mình theo công thức semantic chuẩn:

- **`accent-base`**: Màu thương hiệu chủ đạo (`bg-<accent>-600`, `text-<accent>-400`, `border-<accent>-500/50`) cho các nút Primary Action, active tab, và selection highlight.
- **`accent-hover`**: Trạng thái tương tác khi hover (`hover:bg-<accent>-500`, `hover:text-<accent>-300`).
- **`accent-glow`**: Hiệu ứng hào quang nền tinh tế cho active indicator hoặc icon glowing (`rgba(<accent_rgb>, 0.15)`).
- **`accent-ring`**: Viền focus bàn phím macOS chuẩn Accessibility (`focus-visible:ring-2 focus-visible:ring-<accent>-500/40`).
- **`accent-badge`**: Nền mờ cho các pill/badge trạng thái (`bg-<accent>-500/10 text-<accent>-300 border-<accent>-500/20`).
- **`accent-icon`**: Điểm nhấn nhận diện trên thanh Header và App Icon (`text-<accent>-400`).

### 3.2. App-Specific Theme Immersion Model (Cơ Chế Trải Nghiệm Màu Sắc Toàn Diện Theo Từng App)

Thay vì chỉ sử dụng một màu nền xám trung tính chung (`slate-950`) và điểm xuyết một vài nút bấm có màu accent, Nexus yêu cầu các mini app áp dụng **Full App-wide Theme Immersion**: **Toàn bộ canvas nền, các lớp bề mặt (surfaces), viền mờ (borders), ánh hào quang (ambient glow), tông màu văn bản (text tints), và thanh cuộn (custom scrollbars) đều được ngâm (immersed) trong dải sắc thái thương hiệu đặc trưng của ứng dụng đó**.

#### So Sánh Giữa Mô Hình Cũ (Accent-Only) và Mô Hình Toàn Diện (Full Immersion):

| Thành Phần Giao Diện | Mô Hình Accent-Only (Lỗi Thời) | Mô Hình Full Theme Immersion (Chuẩn Nexus Mới)                                                     |
| :------------------- | :----------------------------- | :------------------------------------------------------------------------------------------------- |
| **Root Canvas**      | Xám xỉn chung (`slate-950`)    | Sâu thẳm mang sắc thái thương hiệu (`#031411` Dark Teal cho 2D Pet, `#0d0b18` cho SlackBot).       |
| **Atmospheric Glow** | Không có                       | Radial Gradient tinh tế phản chiếu từ đỉnh cửa sổ (`rgba(accent, 0.18)` chuyển dần về trong suốt). |
| **Surface 1 (Base)** | Nền card xám đơn điệu          | Bề mặt tối kính mờ pha sắc thái thương hiệu (`#061c18/80`, viền `rgba(accent, 0.2)`).              |
| **Surface 2 (Card)** | Thẻ xám viền trắng mờ          | Bề mặt nâng kính acrylic (`#082620/65`, viền `rgba(accent, 0.25)`, hover `#0c332b`).               |
| **Surface 3 (High)** | Nền active trơn                | Bề mặt nổi bật tối đa (`#0e3d34/95`, viền `rgba(accent, 0.6)`).                                    |
| **Header & Tabs**    | Header slate-900 khô cứng      | Header kính mờ pha màu thương hiệu (`#051b17/90`), Segmented Tab bar đổ bóng ngọc sang trọng.      |
| **Typography Tints** | Trắng và xám slate nhạt        | Trắng ánh ngọc (`#f0fdf9`), chữ phụ pha sắc teal (`#5eead4`), chữ mờ (`#2dd4bf/75`).               |
| **Scrollbars**       | Scrollbar hệ thống macOS xám   | Thumb thanh mảnh mang màu thương hiệu (`rgba(accent, 0.25)`, hover `rgba(accent, 0.5)`).           |
| **Context Menu**     | Menu xám đen chung             | Kính mờ siêu tối ngâm sắc thái thương hiệu (`#041915/95`, viền `rgba(accent, 0.35)`).              |

---

## 4. Typography

Typography must establish hierarchy without relying on oversized text.

Define a consistent type scale for:

- Window and page titles.
- Section headings.
- Body text.
- Form labels.
- Secondary descriptions.
- Metadata, timestamps, and status information.

### Rules:

- Use the existing font stack unless there is a concrete reason to change it.
- Prefer restrained font weights and deliberate differences in size.
- Avoid making every heading bold or every label uppercase.
- Use consistent line heights and avoid unnecessary letter spacing.
- Keep secondary text readable; muted must not mean nearly invisible.
- Use tabular numerals where aligned numerical values benefit from them.
- Apply truncation intentionally, with tooltips or another way to access important hidden content.
- Ensure Vietnamese text, punctuation, and mixed Vietnamese/English content render correctly.

---

## 5. Spacing and Layout

Create a coherent spacing system and apply it consistently.

- Use a small, reusable spacing scale instead of arbitrary margins and padding.
- Align headings, descriptions, inputs, buttons, and content edges.
- Give important sections sufficient breathing room.
- Avoid excessive empty space that reduces information density.
- Avoid layouts where every component touches another component or its container boundary.
- Do not use the same padding for every context; dialogs, toolbars, tables, and compact controls have different needs.
- Establish clear relationships between related controls and unrelated sections.
- Prefer predictable alignment and stable layouts over decorative asymmetry.
- Prevent clipping, accidental overflow, overlapping elements, and unnecessary nested scrolling.
- Account for window resizing and smaller supported viewport sizes.

---

## 6. Borders, Radius, and Shadows

One of the primary refinement goals is to reduce unnecessary visual containers.

- Do not wrap every piece of content in a card.
- Avoid cards nested inside cards unless the hierarchy genuinely requires them.
- Do not draw borders around an entire section, each subsection, every row, and every control simultaneously.
- Prefer spacing, alignment, subtle background changes, or a single separator to communicate grouping.
- Use a consistent, limited radius scale.
- Keep shadows subtle and primarily reserved for elevation.
- Do not apply the same rounded-card treatment indiscriminately to buttons, fields, tables, dialogs, and content sections.

Every border, shadow, and container must have a clear purpose.

---

## 7. Buttons and Interactive Controls

Establish a clear hierarchy between primary, secondary, tertiary, and destructive actions.

- Use the accent color for the most important action in a context, not every available action.
- Prefer quiet secondary actions with clear hover and focus states.
- Use icon-only buttons only when the icon is recognizable and the action is clear.
- Provide tooltips and accessible labels for icon-only controls.
- Keep button heights, icon alignment, padding, and text baselines consistent.
- Use appropriate hit areas without making compact desktop controls unnecessarily large.
- Make hover, active, focused, disabled, and loading states visually distinct.
- Avoid excessive outlines, shadows, glow effects, and animations.
- Do not communicate state through color alone.

All interactive controls must perform their intended action. Never create decorative controls that appear functional but do nothing.

---

## 8. Forms and Settings Dialogs

Settings are an important part of Nexus and must feel organized, focused, and easy to navigate.

- Group settings by user intent rather than implementation details alone.
- Use clear section headings and concise supporting descriptions.
- Keep labels close to their controls.
- Align fields consistently and use appropriate control widths.
- Use consistent heights and spacing for inputs, selects, textareas, and buttons.
- Avoid making a dialog unnecessarily tall or wide.
- Preserve a clear distinction between the dialog header, content, and footer.
- Keep primary and secondary footer actions consistently positioned.
- Use tabs only when there are meaningful groups of settings.
- Preserve form values, validation, and keyboard behavior.
- Show validation and save feedback near the relevant controls.
- Avoid nested scrolling when the content can reasonably fit within the dialog.
- Handle long prompts and configuration values without clipping or hiding essential actions.
- Ensure reset-to-default actions are clear and do not accidentally discard unsaved changes.

Settings dialogs should feel like focused desktop workspaces, not compressed web administration pages.

---

## 9. Lists, Tables, and Dense Information

Nexus is a productivity application, so information density matters.

- Make lists and tables easy to scan quickly.
- Establish consistent row heights, column alignment, indentation, and metadata placement.
- Separate rows subtly instead of boxing every row individually.
- Use typography and spacing to distinguish primary content from secondary metadata.
- Make selection, expansion, merging status, errors, and other states immediately understandable.
- Avoid excessive badges and colorful labels.
- Truncate long repository names, commit titles, and descriptions gracefully.
- Provide access to full content when truncation hides meaningful information.
- Keep checkboxes, disclosure controls, external links, and row actions aligned.
- Ensure scrolling does not cut through text or controls.
- Avoid fixed heights that hide important information unless the interaction clearly communicates that the area is scrollable.
- Handle empty, loading, error, and large-data states consistently.

Do not sacrifice readability merely to fit more content into a screenshot.

---

## 10. Icons and Visual Language

- Prefer the icon library already used by the application (`lucide-react`).
- Use one consistent icon style and visual weight.
- Match icon size, stroke weight, and alignment to the surrounding typography.
- Use icons to clarify actions, navigation, and state.
- Avoid decorative icons that add noise without communicating meaning.
- Do not mix emoji, filled icons, thin outline icons, and unrelated icon styles arbitrarily.
- Avoid using a colored icon inside a circular background for every section.

---

## 11. Motion and Feedback

Motion must explain an interaction or state transition.

- Prefer subtle, short transitions.
- Use animation for opening and closing dialogs, expanding sections, and changing meaningful states when appropriate.
- Avoid unnecessary bouncing, scaling, pulsing, and decorative motion.
- Respect reduced-motion preferences where applicable.
- Provide clear feedback for save, copy, refresh, loading, and failure actions.
- Do not use animation as a substitute for clear state indicators.

---

## 12. macOS Desktop Experience

Respect the conventions of the actual desktop technology used by the project.

- Inspect the existing window-management and title-bar implementation before changing it.
- Preserve correct traffic-light positioning and window behavior.
- Respect draggable regions and ensure interactive controls are not placed inside unintended drag areas.
- Support keyboard navigation and visible focus indicators.
- Use familiar shortcuts and predictable Escape/Enter behavior where appropriate.
- Avoid unnecessary web-style navigation patterns when a simpler desktop interaction is more suitable.
- Ensure dialogs, popovers, and menus have appropriate dimensions and positioning.
- Preserve system integrations and accessibility behavior.
- Do not imitate native macOS controls with inaccurate custom styling merely for appearance.

Follow Apple Human Interface Guidelines where relevant, while respecting the application's existing technical architecture.

---

## 13. Consistency Across the Application

Before creating a new component, inspect whether an equivalent component already exists.

- Reuse shared components and semantic design tokens from `@nexus/ui`.
- Establish consistent button variants, input styles, modal layouts, tooltips, menus, status indicators, and empty states.
- Avoid screen-specific overrides that create unexplained inconsistencies.
- If a shared component needs improvement, consider the impact on every screen that uses it.
- Keep component responsibilities clear and implementation maintainable.
- Avoid unnecessary abstractions and do not turn a small visual improvement into a large architectural refactor.

A design decision should remain consistent everywhere the same interaction pattern appears.

---

## 14. Visual Quality Review

After implementing a UI change, review it as a product designer rather than merely checking whether the code compiles.

Inspect the actual rendered interface when suitable browser or desktop inspection tools are available.

Review these questions:

1. Is the primary action obvious without making secondary actions noisy?
2. Is the visual hierarchy clear at a glance?
3. Are borders and containers being overused?
4. Are typography and spacing consistent?
5. Does the interface feel like a coherent desktop application?
6. Is there unnecessary decoration or generic AI-generated styling?
7. Are controls aligned and sized appropriately?
8. Do long text, narrow windows, and realistic content expose layout problems?
9. Are loading, empty, error, hover, focus, disabled, and selected states handled where applicable?
10. Does the change preserve existing functionality?

Fix visible issues discovered during the review.

Run the available type-check, lint, and build commands when relevant. Do not claim visual inspection or successful checks that were not actually performed.

---

## 15. Scope and Implementation Strategy

When asked to improve an existing screen:

1. Identify the highest-impact visual and usability problems.
2. Prioritize layout, hierarchy, spacing, alignment, and consistency before decorative details.
3. Make focused changes that preserve the current visual identity.
4. Avoid unrelated refactors.
5. Verify the result and summarize the meaningful improvements.

When asked to create a new screen:

1. Understand the user workflow and information hierarchy.
2. Define a visual direction consistent with Nexus.
3. Reuse the existing design system.
4. Implement realistic content and interaction states.
5. Review the rendered interface when possible.

Do not blindly redesign every screen, introduce unnecessary dependencies, or change established conventions without a clear benefit.

---

## Definition of Done

A UI task is complete when it is functionally correct, visually coherent, consistent with Nexus, appropriately accessible, and maintainable.

The objective is not to make every screen visually impressive. The objective is to make every screen feel deliberately designed, easy to use, and worthy of a polished macOS application.
