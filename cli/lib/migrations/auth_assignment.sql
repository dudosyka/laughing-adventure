CREATE TABLE IF NOT EXISTS `mydb`.`auth_assignment` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `parent` INT NOT NULL,
  `child` INT NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC) VISIBLE,
  INDEX `fk_auth_assignment_rule_entity1_idx` (`parent` ASC) VISIBLE,
  INDEX `fk_auth_assignment_rule_entity2_idx` (`child` ASC) VISIBLE,
  CONSTRAINT `fk_auth_assignment_rule_entity1`
    FOREIGN KEY (`parent`)
    REFERENCES `mydb`.`rule_entity` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_auth_assignment_rule_entity2`
    FOREIGN KEY (`child`)
    REFERENCES `mydb`.`rule_entity` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB