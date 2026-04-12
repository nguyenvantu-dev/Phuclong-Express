# Searchable Select Integration

Tài liệu này mô tả pattern dùng input tìm kiếm có dropdown gợi ý custom, nhưng chỉ cập nhật filter/form và gọi API khi user chọn đúng một giá trị có trong list.

## Use Case

Dùng khi field đang là `<select>` nhưng danh sách dài, ví dụ `Username` ở `/admin/orders/list`.

Mục tiêu:
- Cho phép gõ để tìm nhanh trong danh sách.
- Không gọi API khi user đang gõ giá trị chưa hợp lệ.
- Chỉ gọi API khi user click chọn một item trong list.
- Khi đang tìm, highlight row username đầu tiên, dùng ArrowUp/ArrowDown để đổi row, nhấn Enter để chọn row active.
- Xóa input thì clear filter về tất cả.

## Data Contract

API options nên trả về list có value ổn định:

```ts
type UsernameOption = {
  username: string;
};
```

Ví dụ:

```ts
const { data: usernames } = useQuery({
  queryKey: ['usernames'],
  queryFn: getUsernames,
});
```

## State Pattern

Tách state hiển thị input khỏi state filter dùng cho API.

```ts
const [filters, setFilters] = useState<QueryParams>({});
const [usernameInput, setUsernameInput] = useState('');
const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
const usernameDropdownRef = useRef<HTMLDivElement>(null);
```

`usernameInput` chỉ phục vụ UI đang gõ. `filters.username` mới là state nằm trong `queryKey` và trigger API.

## Change Handler

```ts
const handleFilterChange = (key: keyof QueryParams, value: string) => {
  setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
};

const handleUsernameInputChange = (value: string) => {
  setUsernameInput(value);
  setShowUsernameDropdown(true);
  setActiveUsernameIndex(0);

  if (!value) {
    handleFilterChange('username', '');
  }
};

const handleUsernameSelect = (value: string) => {
  setUsernameInput(value);
  handleFilterChange('username', value);
  setShowUsernameDropdown(false);
  setActiveUsernameIndex(0);
};

const handleUsernameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

  event.preventDefault();
  if (event.key === 'ArrowDown') {
    setShowUsernameDropdown(true);
    if (filteredUsernames.length > 0) {
      setActiveUsernameIndex((prev) => (prev + 1) % filteredUsernames.length);
    }
    return;
  }

  if (event.key === 'ArrowUp') {
    setShowUsernameDropdown(true);
    if (filteredUsernames.length > 0) {
      setActiveUsernameIndex((prev) => (prev - 1 + filteredUsernames.length) % filteredUsernames.length);
    }
    return;
  }

  const activeUsername = filteredUsernames[activeUsernameIndex]?.username;
  if (activeUsername) {
    handleUsernameSelect(activeUsername);
  } else if (!usernameInput.trim()) {
    handleUsernameSelect('');
  }
};
```

Hành vi:
- Gõ `abc`: chỉ update input và lọc dropdown, không update filter, không call API.
- Click chọn `abc`: update `filters.username`, query refetch.
- ArrowUp/ArrowDown khi đang có nhiều kết quả: đổi row active.
- Nhấn Enter khi đang có kết quả: chọn username active trong dropdown.
- Xóa trống: clear `filters.username`, query refetch về tất cả user.

## JSX

```tsx
<label htmlFor="order-username-filter">Username</label>
<input
  id="order-username-filter"
  type="text"
  value={usernameInput}
  onChange={(e) => handleUsernameInputChange(e.target.value)}
  onKeyDown={handleUsernameKeyDown}
  onFocus={() => setShowUsernameDropdown(true)}
  placeholder="Nhập Username"
  autoComplete="off"
/>
{showUsernameDropdown && (
  <div className="absolute z-20 mt-1 max-h-64 w-56 overflow-auto rounded-lg border border-gray-300 bg-white py-1 text-sm shadow-lg">
    <button type="button" onClick={() => handleUsernameSelect('')}>
      --Tất cả User--
    </button>
    {filteredUsernames.map((u) => (
      <button key={u.username} type="button" onClick={() => handleUsernameSelect(u.username)}>
        {u.username}
      </button>
    ))}
    {filteredUsernames.length === 0 && (
      <div>Không có username phù hợp</div>
    )}
  </div>
)}
```

## Integration Checklist

- Input dùng state riêng, ví dụ `usernameInput`.
- Query API dùng filter riêng, ví dụ `filters.username`.
- Handler gõ chỉ update input/dropdown.
- Handler click option mới update filter/form.
- Handler Enter chọn option username đang active.
- Handler ArrowUp/ArrowDown đổi option username đang active.
- Clear input phải clear filter.
- `queryKey` dùng `filters`, không dùng `usernameInput`.
- Dropdown custom thay cho `datalist` khi cần style menu.
- Nếu field nằm trong table hoặc wrapper có `overflow`, render dropdown bằng `position: fixed` và lấy tọa độ từ `input.getBoundingClientRect()` để tránh bị che/cắt.
- Build pass sau khi tích hợp.

## Current Reference

Implementation hiện tại:

`frontend/src/app/admin/orders/list/page.tsx`
`frontend/src/app/admin/orders/new/page.tsx`
`frontend/src/app/admin/debt-reports/page.tsx`

Key points:
- `usernameInput` lưu text đang gõ.
- `handleUsernameInputChange` chỉ update input và mở dropdown.
- `filters.username` chỉ đổi khi click chọn username hoặc chọn tất cả.
- Với form create, `form.username` chỉ có giá trị khi click chọn username trong list.

## Unresolved Questions

None.
