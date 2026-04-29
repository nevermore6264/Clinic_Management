package com.clinic.service;

import com.clinic.dto.BaoCaoDoanhThuDto;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class XuatBaoCaoExcelService {

    private final BaoCaoService baoCaoService;

    public byte[] xuatExcelDoanhThu(LocalDate tuNgay, LocalDate denNgay, Long maBacSi, Long maDichVu) {
        List<BaoCaoDoanhThuDto> duLieu = baoCaoService.doanhThuTheoNgay(tuNgay, denNgay, maBacSi, maDichVu);
        try (Workbook wb = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = wb.createSheet("Doanh thu");
            CellStyle kieuTieuDe = wb.createCellStyle();
            Font fontTieuDe = wb.createFont();
            fontTieuDe.setBold(true);
            kieuTieuDe.setFont(fontTieuDe);

            int dong = 0;
            Row tieuDe = sheet.createRow(dong++);
            tieuDe.createCell(0).setCellValue("BÁO CÁO DOANH THU " + tuNgay + " - " + denNgay);
            dong++;
            Row hangTieuDe = sheet.createRow(dong++);
            hangTieuDe.createCell(0).setCellValue("Ngày");
            hangTieuDe.createCell(1).setCellValue("Doanh thu (VNĐ)");
            hangTieuDe.createCell(2).setCellValue("Số giao dịch");
            hangTieuDe.getCell(0).setCellStyle(kieuTieuDe);
            hangTieuDe.getCell(1).setCellStyle(kieuTieuDe);
            hangTieuDe.getCell(2).setCellStyle(kieuTieuDe);

            for (BaoCaoDoanhThuDto d : duLieu) {
                Row hang = sheet.createRow(dong++);
                hang.createCell(0).setCellValue(d.getNgay() != null ? d.getNgay().toString() : "");
                hang.createCell(1).setCellValue(d.getTongDoanhThu() != null ? d.getTongDoanhThu().doubleValue() : 0);
                hang.createCell(2).setCellValue(d.getSoLichHen() != null ? d.getSoLichHen() : 0);
            }
            sheet.autoSizeColumn(0);
            sheet.autoSizeColumn(1);
            sheet.autoSizeColumn(2);
            wb.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Xuất Excel thất bại", e);
        }
    }
}
