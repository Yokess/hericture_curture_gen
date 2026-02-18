package heritage.gen.modules.archive.repository;

import heritage.gen.modules.archive.model.ArcProcessStepEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ArcProcessStepRepository extends JpaRepository<ArcProcessStepEntity, Long> {

    @Query("SELECT s FROM ArcProcessStepEntity s WHERE s.videoId = :videoId ORDER BY s.stepOrder ASC")
    List<ArcProcessStepEntity> findByVideoIdOrderByStepOrder(@Param("videoId") Long videoId);
}
