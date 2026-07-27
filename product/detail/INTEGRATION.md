# 카페24 템플릿 연동 방법

베이직 스킨 템플릿에는 옵션 피커가 필요한 카페24 영역이 이미 존재합니다. 두 영역을 교체하거나 삭제하지 마세요.

## 1. 기본 옵션 테이블에 마커 추가 (선택)

기존 옵션 테이블에 아래 속성만 추가할 수 있습니다.

```html
<table border="1" summary="" module="product_option" data-option-picker-native-options>
```

이 테이블의 기본 옵션 행에는 `{$form.option}`이 포함되어 있습니다. 커스텀 UI로 기본 옵션을 시각적으로 숨기더라도 해당 DOM은 반드시 유지해야 합니다. 테스트한 베이직 스킨은 `table.xans-product-option .ec-product-button`으로 자동 탐색되므로, 마커는 스킨 구조가 다를 때만 필요합니다.

### suffix 옵션 금액 설정

커스텀 피커는 한 개입수 그룹에서 카페24 suffix 옵션 하나만 선택합니다. 카운터가 `1`이면 `_1`, `2`이면 `_2`를 선택하므로 suffix는 해당 개입수의 **누적 수량과 가격 단계**입니다. 기본 판매가가 `24,700원`인 테스트 상품의 예시는 아래와 같습니다.

| 옵션값 | 카페24 추가금액 |
| --- | ---: |
| `10개입_1` | `0원` |
| `10개입_2` | `24,700원` |
| `30개입_1` | `45,800원` |
| `30개입_2` | `116,300원` |
| `50개입_1` | `86,800원` |
| `50개입_2` | `198,300원` |
| `100개입_1` | `171,300원` |
| `100개입_2` | `367,300원` |

예를 들어 카운터가 `2`가 되면 `_1`을 삭제하고 `_2`만 선택합니다. `10개입_2`의 `24,700원`은 기본가와 합쳐져 `49,400원`으로 계산됩니다. `_1`, `_2`를 동시에 선택하지 않으므로 두 가격이 합산되지 않습니다.

## 2. 커스텀 옵션 행 삽입

첫 번째 `<tbody module="product_option">` 내부에서 기존 기본 옵션 `<tr>` 바로 다음에 `detail-snippet.html` 내용을 삽입합니다. 스니펫은 `<tr>`이므로 테이블 마크업을 유효하게 유지합니다.

## 3. 카페24 선택상품 영역에 마커 추가 (선택)

기존 총 상품 영역에 아래 속성을 추가할 수 있습니다.

```html
<div id="{$total.total_id}" class="{$total.total_display|display}" data-option-picker-selected-list>
```

카페24는 이 컨테이너 안에 선택상품 행을 추가합니다. 옵션 피커는 행을 직접 생성하지 않고, 카페24가 만든 삭제 컨트롤을 클릭해 suffix 옵션을 제거합니다. 테스트한 베이직 스킨은 `#totalProducts`를 사용하므로 자동 탐색됩니다.

## 4. 자산 업로드와 로드 태그 삽입

스마트디자인 파일 목록에서 아래 경로로 파일을 업로드합니다. JavaScript는 `option-picker.js`의 상대 `import` 경로가 유지되도록 디렉터리 구조를 그대로 보존해야 합니다.

```text
/css/custom/option-picker.css
/js/custom/option-picker/option-picker.js
/js/custom/option-picker/config/catalog.js
/js/custom/option-picker/core/create-option-picker.js
/js/custom/option-picker/adapters/cafe24-product.js
/js/custom/option-picker/services/selection-reconciler.js
/js/custom/option-picker/ui/option-picker-view.js
/js/custom/option-picker/utils/dom.js
```

카페24의 CSS 최적화 번들이 새 파일을 즉시 반영하지 않는 경우가 있으므로, `<!--@css(...)-->` 대신 직접 `<link>`로 불러옵니다. JavaScript는 모듈 간 `import`를 사용하므로 `<!--@js(...)-->`로 추가하면 안 됩니다. `asset-tags.html`의 내용을 옵션 테이블 **밖**에 삽입합니다. 제공받은 `detail.html`에서는 옵션 테이블의 닫는 `</table>` 바로 다음, `<dl module="product_quantity" ...>` 바로 전에 넣습니다.

```html
            </table>

            <link rel="stylesheet" href="/css/custom/option-picker.css?v=20260728-18">
            <script type="module" src="/js/custom/option-picker/option-picker.js?v=20260728-18"></script>

            <dl module="product_quantity" class="ec-base-desc quantity">
```

상품 설정을 추가하기 전에 업로드한 JavaScript가 `type="module"`로 정상 로드되는지 확인합니다.

카페24 CDN은 같은 경로의 JavaScript 이전 버전을 유지할 수 있습니다. JavaScript 파일을 교체할 때는 `asset-tags.html`과 변경된 모듈을 import하는 파일의 `v` 값을 같은 새 값으로 변경해 업로드합니다.

## 5. 스토어프론트에서 DOM 어댑터 검증

테스트 상품(상품번호 `11`)은 `.ec-product-button > li`로 텍스트 버튼 옵션을 렌더링하고, 선택상품 컨테이너로 `#totalProducts`를 사용합니다. 업로드 후 스토어프론트를 점검해 구조가 다를 때만 `adapters/cafe24-product.js`를 조정합니다.

- 실제 옵션값과 일치하는 카페24 기본 컨트롤을 찾아 정상 클릭 경로로 선택합니다.
- 카페24가 생성한 선택상품 행에서 실제 옵션값을 읽습니다.

나머지 모듈은 카페24 선택자 변경 없이 유지하는 것을 목표로 합니다.
