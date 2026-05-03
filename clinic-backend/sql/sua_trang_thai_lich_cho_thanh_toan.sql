-- Sửa lịch đang ghi DA_THANH_TOAN trong khi hóa đơn vẫn chưa thanh toán đủ (đồng bộ với trạng thái mới CHO_THANH_TOAN).
-- Chạy một lần sau khi deploy bản thêm enum CHO_THANH_TOAN (tùy dữ liệu thực tế).

UPDATE lich_hen lh
SET trang_thai = 'CHO_THANH_TOAN'
WHERE lh.trang_thai = 'DA_THANH_TOAN'
  AND EXISTS (
    SELECT 1
    FROM hoa_don hd
    WHERE hd.ma_lich_hen = lh.id
      AND hd.trang_thai IN ('CHO_THANH_TOAN', 'MOT_PHAN')
  );
