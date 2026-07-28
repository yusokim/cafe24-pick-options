# 카페24 상품상세 골라담기 옵션

카페24 스마트디자인 상품상세 페이지에 적용하는 설정형 골라담기 옵션 UI 자산입니다.

## 구조

- `product/detail/config/catalog.js`: 상품번호별 노출 데이터와 실제 카페24 옵션값 매핑
- `product/detail/option-picker.js`: 옵션 피커를 생성하는 진입점
- `product/detail/adapters/cafe24-product.js`: 카페24 DOM 선택자와 이벤트를 다루는 유일한 경계
- `product/detail/services/selection-reconciler.js`: 카페24 선택상품 목록으로 카드 상태를 계산
- `product/detail/ui/option-picker-view.js`: 카드 렌더링과 접근 가능한 상태 표시
- `product/detail/ui/mobile-option-sheet-view.js`: 좁은 화면용 옵션 바텀시트 렌더링
- `product/detail/core/create-option-picker.js`: 어댑터·상태 동기화·UI 모듈 조합
- `product/detail/option-picker.css`: 옵션 피커 범위에 한정된 PC/MO 스타일
- `product/detail/product-detail-responsive.css`: 상품 이미지·정보 영역의 공용 반응형 레이아웃
- `product/detail/detail-snippet.html`: 카페24 `/product/detail.html`의 옵션 테이블에 삽입할 마크업
- `product/detail/asset-tags.html`: 옵션 테이블 밖에 삽입할 JavaScript 모듈 로드 태그
- `product/detail/INTEGRATION.md`: 템플릿 삽입 위치와 연동 절차

커스텀 UI는 표시와 사용자 상호작용만 담당합니다. 실제 선택상품 행 생성, 가격 계산, 재고, 수량, 장바구니, 바로구매는 카페24 기본 로직이 담당합니다.

## 개발 절차

1. 테스트 상품에 요구된 독립 선택형 텍스트 버튼 옵션을 설정합니다.
2. 스마트디자인에 옵션 행 스니펫과 자산 로드 태그를 각각 삽입하고 JS·CSS 자산을 업로드 또는 갱신합니다.
3. 렌더링된 기본 옵션과 선택상품 DOM을 확인하고, 베이직 스킨 구조가 다를 경우 `cafe24-product.js`의 어댑터 선택자만 조정합니다.
4. 편집한 스킨을 대표 디자인으로 설정한 뒤, 로그아웃 또는 시크릿 창의 스토어프론트 URL에서 확인합니다.

## 현재 상태

테스트 상품(`product_no=11`)은 `.ec-product-button > li` 형태의 카페24 텍스트 버튼 옵션을 사용하며, 선택상품은 `#totalProducts`에 렌더링됩니다. SEO URL에서는 기본 옵션의 `option_product_no` 속성으로 상품번호를 식별합니다. 어댑터는 이 구조를 기준으로 구성했습니다. 스마트디자인에 자산을 적용한 뒤 기본 옵션 선택, 삭제, 구매 흐름을 스토어프론트에서 검증해야 합니다.
