# Loom iOS 프로젝트 구조

## 디렉토리 구조

```
Loom/
├── LoomApp.swift                    # 앱 진입점
├── ContentView.swift                # 메인 탭 뷰
│
├── Core/                            # 공통 모듈
│   ├── Config/
│   │   └── AppConfig.swift          # 환경변수, API 키
│   ├── Extensions/
│   │   ├── Date+.swift
│   │   ├── String+.swift
│   │   └── View+.swift
│   ├── Network/
│   │   └── SupabaseManager.swift    # Supabase 클라이언트 싱글톤
│   └── Utils/
│       ├── Clipboard.swift          # 복사 유틸
│       └── HapticFeedback.swift
│
├── Models/                          # 데이터 모델
│   ├── Item.swift
│   ├── ItemChunk.swift
│   ├── ItemImage.swift
│   ├── Collection.swift
│   ├── SearchResult.swift
│   └── User.swift
│
├── Repositories/                    # 데이터 접근 레이어
│   ├── Protocols/
│   │   ├── ItemRepositoryProtocol.swift
│   │   ├── SearchRepositoryProtocol.swift
│   │   ├── CollectionRepositoryProtocol.swift
│   │   └── AuthRepositoryProtocol.swift
│   ├── SupabaseItemRepository.swift
│   ├── SupabaseSearchRepository.swift
│   ├── SupabaseCollectionRepository.swift
│   └── SupabaseAuthRepository.swift
│
├── Services/                        # 비즈니스 로직
│   ├── ItemService.swift            # 아이템 CRUD
│   ├── SearchService.swift          # 검색 처리
│   ├── ImageService.swift           # 이미지 업로드/다운로드
│   ├── OCRService.swift             # Apple Vision OCR
│   ├── AIService.swift              # Edge Function 호출
│   └── CollectionService.swift      # 컬렉션 관리
│
├── Features/                        # 기능별 모듈
│   ├── Auth/
│   │   ├── Views/
│   │   │   ├── LoginView.swift
│   │   │   ├── SignUpView.swift
│   │   │   └── AuthView.swift
│   │   └── ViewModels/
│   │       └── AuthViewModel.swift
│   │
│   ├── Home/
│   │   ├── Views/
│   │   │   ├── HomeView.swift
│   │   │   ├── RecentItemsSection.swift
│   │   │   └── QuickAccessSection.swift
│   │   └── ViewModels/
│   │       └── HomeViewModel.swift
│   │
│   ├── Search/
│   │   ├── Views/
│   │   │   ├── SearchView.swift
│   │   │   ├── SearchResultCard.swift
│   │   │   └── SearchResultList.swift
│   │   └── ViewModels/
│   │       └── SearchViewModel.swift
│   │
│   ├── Save/
│   │   ├── Views/
│   │   │   ├── SaveView.swift
│   │   │   ├── TextInputArea.swift
│   │   │   └── ImagePickerArea.swift
│   │   └── ViewModels/
│   │       └── SaveViewModel.swift
│   │
│   ├── Detail/
│   │   ├── Views/
│   │   │   ├── ItemDetailView.swift
│   │   │   ├── ItemEditView.swift
│   │   │   └── ImageGalleryView.swift
│   │   └── ViewModels/
│   │       └── ItemDetailViewModel.swift
│   │
│   ├── Collections/
│   │   ├── Views/
│   │   │   ├── CollectionsView.swift
│   │   │   ├── CollectionDetailView.swift
│   │   │   └── AddToCollectionSheet.swift
│   │   └── ViewModels/
│   │       └── CollectionsViewModel.swift
│   │
│   └── Settings/
│       ├── Views/
│       │   ├── SettingsView.swift
│       │   ├── AccountView.swift
│       │   └── AppearanceView.swift
│       └── ViewModels/
│           └── SettingsViewModel.swift
│
├── SharedUI/                        # 공용 UI 컴포넌트
│   ├── Components/
│   │   ├── TagChip.swift
│   │   ├── CategoryBadge.swift
│   │   ├── CopyButton.swift
│   │   ├── LoadingView.swift
│   │   ├── EmptyStateView.swift
│   │   └── ToastView.swift
│   └── Modifiers/
│       ├── CardStyle.swift
│       └── ShimmerEffect.swift
│
├── ShareExtension/                  # iOS 공유 확장
│   ├── ShareViewController.swift
│   └── Info.plist
│
└── Resources/
    ├── Assets.xcassets/
    ├── LaunchScreen.storyboard
    └── Info.plist
```

## 핵심 모델

```swift
// Models/Item.swift
import Foundation

struct Item: Identifiable, Codable {
    let id: UUID
    let userId: UUID
    var title: String?
    let originalContent: String
    var summary: String?
    var category: String?
    var tags: [String]
    let contentType: ContentType
    var copyCount: Int
    var lastUsedAt: Date?
    var aiProcessed: Bool
    let createdAt: Date
    var updatedAt: Date
    
    enum ContentType: String, Codable {
        case text
        case image
        case mixed
    }
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case title
        case originalContent = "original_content"
        case summary
        case category
        case tags
        case contentType = "content_type"
        case copyCount = "copy_count"
        case lastUsedAt = "last_used_at"
        case aiProcessed = "ai_processed"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}

// Models/SearchResult.swift
struct SearchResult: Identifiable {
    let id: UUID
    let chunkId: UUID
    let itemId: UUID
    let chunkText: String
    let similarity: Double
    let itemTitle: String?
    let itemCategory: String?
    let itemTags: [String]
    let itemCreatedAt: Date
    let images: [ItemImage]
}
```

## Repository 패턴

```swift
// Repositories/Protocols/ItemRepositoryProtocol.swift
protocol ItemRepositoryProtocol {
    func save(_ item: Item) async throws -> Item
    func fetch(id: UUID) async throws -> Item
    func fetchAll(userId: UUID, limit: Int, offset: Int) async throws -> [Item]
    func update(_ item: Item) async throws -> Item
    func delete(id: UUID) async throws
    func incrementCopyCount(id: UUID) async throws
}

// 이 패턴으로 구현하면:
// 1. 테스트 시 MockItemRepository 사용 가능
// 2. 나중에 Supabase를 다른 백엔드로 교체 가능
// 3. 각 레이어가 독립적으로 동작
```

## 의존성 주입

```swift
// LoomApp.swift
@main
struct LoomApp: App {
    @State private var authVM = AuthViewModel()
    
    var body: some Scene {
        WindowGroup {
            if authVM.isAuthenticated {
                ContentView()
                    .environment(authVM)
            } else {
                AuthView()
                    .environment(authVM)
            }
        }
    }
}
```

## Swift Packages (의존성)

```
// Package.swift 의존성
dependencies: [
    .package(url: "https://github.com/supabase/supabase-swift", from: "2.0.0"),
    .package(url: "https://github.com/onevcat/Kingfisher", from: "7.0.0"),
]
```
