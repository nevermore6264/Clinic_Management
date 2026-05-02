package com.clinic.service;

import com.clinic.dto.ChuyenKhoaDto;
import com.clinic.repository.ChuyenKhoaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChuyenKhoaService {

    private final ChuyenKhoaRepository chuyenKhoaRepository;

    @Transactional(readOnly = true)
    public List<ChuyenKhoaDto> timTatCa() {
        return chuyenKhoaRepository.findAll(Sort.by("tenChuyenKhoa")).stream()
                .map(ck -> {
                    ChuyenKhoaDto dto = new ChuyenKhoaDto();
                    dto.setId(ck.getId());
                    dto.setTenChuyenKhoa(ck.getTenChuyenKhoa());
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
